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
  // @todo Alternate import older React versions
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
      const offset = compiled.ast.html.start > script.start ? 0 : refs.offset;
      const jsEnd = script.content.end + offset;
      refs.components.forEach((component) => {
        const code = `const React$${component} = sveltifyReact(${component});`;
        s.appendRight(jsEnd, code);
      });
      const jsStart = script.content.start + offset;
      s.appendRight(jsStart, importStatement);
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
      const tag = node as Element;
      const component = tag.name.slice(6);
      const tagStart = node.start + refs.offset;
      content.overwrite(tagStart + 1, tagStart + 7, "React$");
      if (refs.components.includes(component) === false) {
        refs.components.push(component);
      }
      tag.attributes.forEach((attr) => {
        if (attr.type === "EventHandler") {
          const event = attr as Transition; // the BaseExpressionDirective is not exposed directly
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
