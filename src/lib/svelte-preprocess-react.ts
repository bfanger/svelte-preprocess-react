import MagicString from "magic-string";
import { compile } from "svelte/compiler";
import type {
  Element,
  Script,
  TemplateNode,
  Transition,
} from "svelte/types/compiler/interfaces";
import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";

export default function preprocessReact(): PreprocessorGroup {
  // @todo Alternate import for older React versions
  const importStatement =
    'import sveltifyReact from "svelte-preprocess-react/sveltifyReact18";';

  return {
    markup: ({ content, filename }) => {
      const compiled = compile(content, { filename });
      const refs: Refs = { offset: 0, components: [] };
      const s = new MagicString(content, { filename });
      replaceTags(compiled.ast.html, s, refs);

      if (refs.components.length === 0) {
        return { code: content };
      }
      const script = compiled.ast.instance || (compiled.ast.module as Script);
      const wrappers = refs.components
        .map((component) => {
          return `const React$${component} = sveltifyReact(${component});`;
        })
        .join(";");

      if (!script) {
        s.prepend(`<script>\n${importStatement}\n\n${wrappers}\n</script>\n\n`);
      } else {
        const offset = compiled.ast.html.start > script.start ? 0 : refs.offset;
        s.appendRight(script.content.end + offset, wrappers);
        s.appendRight(script.content.start + offset, importStatement);
      }
      return {
        code: s.toString(),
        map: s.generateMap(),
      };
    },
  };

  type Refs = { offset: number; components: string[] };
  function replaceTags(node: TemplateNode, content: MagicString, refs: Refs) {
    /* eslint-disable no-param-reassign */
    if (node.type === "Element" && node.name.startsWith("react:")) {
      if (node.children && node.children.length > 0) {
        throw new Error(
          "Nested components are not (yet) supported in svelte-preprocess-react"
        );
      }
      const tag = node as Element;
      const component = tag.name.slice(6);
      const tagStart = node.start + refs.offset;
      const tagEnd = node.end + refs.offset;
      const closeStart = tagEnd - tag.name.length - 3;
      content.overwrite(tagStart + 1, tagStart + 7, "React$");
      if (content.slice(closeStart, closeStart + 8) === `</react:`) {
        content.overwrite(closeStart + 2, closeStart + 8, `React$`);
      }
      if (refs.components.includes(component) === false) {
        refs.components.push(component);
      }
      tag.attributes.forEach((attr) => {
        if (attr.type === "EventHandler") {
          const event = attr as Transition;
          if (event.modifiers.length > 0) {
            throw new Error(
              "event modifier are not (yet) supported for React components"
            );
          }
          const eventStart = event.start + refs.offset;
          content.overwrite(
            eventStart,
            eventStart + 4,
            `on${event.name[0].toUpperCase()}`
          );

          refs.offset -= 1;
        }
      });
    }
    node.children?.forEach((child) => {
      replaceTags(child, content, refs);
    });
  }
}
