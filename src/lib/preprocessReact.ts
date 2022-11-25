import MagicString from "magic-string";
import { compile, preprocess } from "svelte/compiler";
import type {
  CompileOptions,
  Element,
  Script,
  TemplateNode,
  Transition,
} from "svelte/types/compiler/interfaces";
import type {
  PreprocessorGroup,
  Processed,
} from "svelte/types/compiler/preprocess";
import detectReactVersion from "./internal/detectReactVersion.js";

type Options = {
  react?: number | "auto";
  ssr?: boolean; // Set to false to omit renderToString from 'react-dom/server'
  errorMode?: "throw" | "warn";
  preprocess?: PreprocessorGroup | PreprocessorGroup[];
};

const defaults = {
  react: "auto",
  ssr: true,
  errorMode: "throw",
} as const;
export default function preprocessReact(
  options: Options = {}
): PreprocessorGroup {
  let react = options.react ?? defaults.react;
  const ssr = options.ssr ?? defaults.ssr;
  const errorMode = options.errorMode ?? defaults.errorMode;

  return {
    async markup({ content, filename }) {
      try {
        let preprocessed: Processed | undefined;
        if (options.preprocess) {
          preprocessed = await preprocess(content, options.preprocess, {
            filename,
          });
          // eslint-disable-next-line no-param-reassign
          content = preprocessed.code;
        }

        if (react === "auto") {
          react = await detectReactVersion();
        }
        const processed = transform(content, {
          filename,
          react,
          ssr,
          errorMode,
        });
        if (!preprocessed) {
          return processed;
        }
        if (!processed.map) {
          return preprocessed;
        }
        return {
          code: processed.code,
          map: preprocessed.map ?? processed.map, // @todo apply sourcemaps
          dependencies: preprocessed.dependencies,
        };
      } catch (err) {
        if (errorMode === "throw") {
          throw err;
        }
        console.warn(err);
        return { code: content };
      }
    },
  };
}
type TransformOptions = {
  filename?: string;
  react: number;
  ssr: boolean;
  errorMode: CompileOptions["errorMode"];
};
function transform(content: string, options: TransformOptions) {
  const prefix = "React$$";
  let portal: string;
  const imports = [
    `import ${prefix}sveltify from "svelte-preprocess-react/sveltify"`,
  ];
  if (options.react >= 18) {
    imports.push(
      `import ${prefix}ReactDOM from "react-dom/client"`,
      `import { createPortal as ${prefix}createPortal} from "react-dom"`
    );
    portal = `${prefix}createPortal`;
  } else {
    imports.push(`import ${prefix}ReactDOM from "react-dom"`);
    portal = `${prefix}ReactDOM.createPortal`;
  }

  let renderToString = "";
  if (options.ssr) {
    imports.push(
      `import { renderToString as ${prefix}renderToString } from "react-dom/server"`
    );
    renderToString = `, ${prefix}renderToString`;
  }

  const compiled = compile(content, {
    filename: options.filename,
    errorMode: options.errorMode,
    generate: false,
  });
  const s = new MagicString(content, { filename: options.filename });
  const components = replaceReactTags(compiled.ast.html, s);
  const aliases = Object.entries(components);

  if (aliases.length === 0) {
    return { code: content };
  }
  const script = compiled.ast.instance || (compiled.ast.module as Script);
  const wrappers = aliases
    .map(([alias, expression]) => {
      return `const ${alias} = ${prefix}sveltify(${expression}, ${portal}, ${prefix}ReactDOM${renderToString});`;
    })
    .join(";");

  if (!script) {
    s.prepend(`<script>\n${imports.join("; ")}\n\n${wrappers}\n</script>\n\n`);
  } else {
    s.appendRight(script.content.end, wrappers);
    s.appendRight(script.content.start, `${imports.join("; ")}; `);
  }
  return {
    code: s.toString(),
    map: s.generateMap(),
  };
}

function replaceReactTags(
  node: TemplateNode,
  content: MagicString,
  components: Record<string, string> = {}
) {
  /* eslint-disable no-param-reassign */
  if (node.type === "Element" && node.name.startsWith("react:")) {
    const tag = node as Element;
    const componentExpression = tag.name.slice(6);
    const alias = `React$${componentExpression.replace(/\./g, "$")}`;
    const tagStart = node.start;
    const tagEnd = node.end;
    const closeStart = tagEnd - tag.name.length - 3;
    const hasCloseTag =
      content.slice(closeStart, closeStart + 8) === `</react:`;
    content.overwrite(tagStart + 1, tagStart + 1 + tag.name.length, alias);
    if (hasCloseTag) {
      content.overwrite(
        closeStart + 2,
        closeStart + 2 + tag.name.length,
        alias
      );
    }
    if (!components[alias]) {
      if (componentExpression.match(/^[a-z-]+$/)) {
        components[alias] = `"${componentExpression}"`;
      } else {
        components[alias] = componentExpression;
      }
    }
    tag.attributes.forEach((attr) => {
      if (attr.type === "EventHandler" && attr.expression !== null) {
        const event = attr as Transition;
        if (event.modifiers.length > 0) {
          throw new Error(
            "event modifier are not (yet) supported for React components"
          );
        }
        const eventStart = event.start;
        content.overwrite(
          eventStart,
          eventStart + 4,
          `on${event.name[0].toUpperCase()}`
        );
      }
    });
    if (node.children && node.children.length > 0) {
      const isTextContent =
        node.children.filter(
          (child) => ["Text", "MustacheTag"].includes(child.type) === false
        ).length === 0;
      const escaped: string[] = [];
      if (isTextContent) {
        // Convert text & expresions into a children prop.
        escaped.push('"');
        node.children.forEach((child) => {
          if (child.type === "Text") {
            escaped.push(
              child.data.replace(/"/g, `{'"'}`).replace(/\n/g, `{'\\n'}`)
            );
          } else if (child.type === "MustacheTag") {
            const expression = content.original.slice(child.start, child.end);
            escaped.push(expression);
          } else {
            throw new Error(`Unexpected node type:${child.type}`);
          }
        });
        escaped.push('"');
        // slot was converted to children prop
        content.appendRight(
          node.children[0].start - 1,
          ` children=${escaped.join("")} /`
        );
        content.remove(node.children[0].start, node.end);
        return components;
      }
    }
  }
  // traverse children
  node.children?.forEach((child) => {
    replaceReactTags(child, content, components);
  });
  // traverse else branch of IfBlock
  node.else?.children?.forEach((child: TemplateNode) => {
    replaceReactTags(child, content, components);
  });
  // traverse then branch of AwaitBlock
  node.then?.children?.forEach((child: TemplateNode) => {
    replaceReactTags(child, content, components);
  });
  // traverse catch branch of AwaitBlock
  node.catch?.children?.forEach((child: TemplateNode) => {
    replaceReactTags(child, content, components);
  });
  return components;
}
