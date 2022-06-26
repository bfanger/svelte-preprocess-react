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
  const client = options.react >= 18 ? "/client" : "";
  const imports = [
    `import ${prefix}sveltify from "svelte-preprocess-react/sveltifyReact"`,
    `import { createElement as ${prefix}createElement} from "react"`,
    `import ${prefix}ReactDOM from "react-dom${client}"`,
  ];
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

  if (components.length === 0) {
    return { code: content };
  }
  const script = compiled.ast.instance || (compiled.ast.module as Script);
  const wrappers = components
    .map((component) => {
      return `const React$${component} = ${prefix}sveltify(${component}, ${prefix}createElement, ${prefix}ReactDOM${renderToString});`;
    })
    .join(";");

  if (!script) {
    s.prepend(`<script>\n${imports}\n\n${wrappers}\n</script>\n\n`);
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
  components: string[] = []
) {
  /* eslint-disable no-param-reassign */
  if (node.type === "Element" && node.name.startsWith("react:")) {
    const tag = node as Element;
    const component = tag.name.slice(6);
    const tagStart = node.start;
    const tagEnd = node.end;
    const closeStart = tagEnd - tag.name.length - 3;
    content.overwrite(tagStart + 1, tagStart + 7, "React$");
    if (content.slice(closeStart, closeStart + 8) === `</react:`) {
      content.overwrite(closeStart + 2, closeStart + 8, `React$`);
    }
    if (components.includes(component) === false) {
      components.push(component);
    }
    tag.attributes.forEach((attr) => {
      if (attr.type === "EventHandler") {
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
  }
  node.children?.forEach((child) => {
    replaceReactTags(child, content, components);
  });
  return components;
}
