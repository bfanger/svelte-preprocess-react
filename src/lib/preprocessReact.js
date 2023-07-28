import MagicString from "magic-string";
import { compile, preprocess } from "svelte/compiler";
import detectReactVersion from "./internal/detectReactVersion.js";

/**
 * @typedef {import("svelte/compiler").PreprocessorGroup} PreprocessorGroup
 * @typedef {import("svelte/compiler").Processed} Processed
 * @typedef {import("svelte/types/compiler/interfaces").TemplateNode} TemplateNode
 */

const defaults = /** @type {const} */ ({
  react: "auto",
  ssr: true,
  errorMode: "throw",
});

/**
 * Svelte preprocessor to use convert <react:*> tags into Sveltified React components.
 *
 * Imports renderToString from 'react-dom/server' unless the `ssr` option is set to false.
 *
 * @param {{
 *   ssr?: boolean;
 *   react?: number | "auto";
 *   errorMode?: "throw" | "warn";
 *   preprocess?: PreprocessorGroup | PreprocessorGroup[];
 * }} options
 * @returns {PreprocessorGroup}
 */
export default function preprocessReact(options = {}) {
  let react = options.react ?? defaults.react;
  const ssr = options.ssr ?? defaults.ssr;
  const errorMode = options.errorMode ?? defaults.errorMode;

  return {
    async markup({ content, filename }) {
      try {
        /** @type {Processed | undefined} */
        let preprocessed;
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

/**
 * @param {string} content
 * @param {{
 *  filename?: string;
 *  react: number;
 *  ssr: boolean;
 *  errorMode: import("svelte/compiler").CompileOptions["errorMode"]
 * }} options
 * @returns
 */
function transform(content, options) {
  const prefix = "React$$";
  /** @type {string} */
  let portal;
  const imports = [
    `import { sveltify as ${prefix}sveltify } from "svelte-preprocess-react"`,
  ];
  if (options.react >= 18) {
    imports.push(
      `import ${prefix}ReactDOM from "react-dom/client"`,
      `import { createPortal as ${prefix}createPortal} from "react-dom"`,
    );
    portal = `${prefix}createPortal`;
  } else {
    imports.push(`import ${prefix}ReactDOM from "react-dom"`);
    portal = `${prefix}ReactDOM.createPortal`;
  }

  let renderToString = "";
  if (options.ssr) {
    imports.push(
      `import { renderToString as ${prefix}renderToString } from "react-dom/server"`,
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
  const script = compiled.ast.instance || compiled.ast.module;
  const wrappers = aliases
    .map(
      ([alias, expression]) =>
        `const ${alias} = ${prefix}sveltify(${expression}, ${portal}, ${prefix}ReactDOM${renderToString});`,
    )
    .join(";");

  if (!script) {
    s.prepend(`<script>\n${imports.join("; ")}\n\n${wrappers}\n</script>\n\n`);
  } else {
    /** @type {any} */
    const program = script.content;
    s.appendRight(program.end, wrappers);
    s.appendRight(program.start, `${imports.join("; ")}; `);
  }
  return {
    code: s.toString(),
    map: s.generateMap(),
  };
}

/**
 * Replace react:* tags by injecting Sveltified versions of the React components.
 *
 * @param {TemplateNode} node
 * @param {MagicString} content
 * @param {Record<string, string>} components
 */
function replaceReactTags(node, content, components = {}) {
  /* eslint-disable no-param-reassign */
  if (node.type === "Element" && node.name.startsWith("react:")) {
    /** @type {import("svelte/types/compiler/interfaces").Element} */
    const tag = /** @type {any} */ (node);
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
        alias,
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
        const event = attr;
        if (event.modifiers.length > 0) {
          throw new Error(
            "event modifier are not (yet) supported for React components",
          );
        }
        const eventStart = event.start;
        content.overwrite(
          eventStart,
          eventStart + 4,
          `on${event.name[0].toUpperCase()}`,
        );
      }
    });
    if (node.children && node.children.length > 0) {
      const isTextContent =
        node.children.filter(
          (child) => ["Text", "MustacheTag"].includes(child.type) === false,
        ).length === 0;
      /** @type {string[]} */
      const escaped = [];
      if (isTextContent) {
        // Convert text & expressions into a children prop.
        escaped.push('"');
        node.children.forEach((child) => {
          if (child.type === "Text") {
            escaped.push(
              child.data.replace(/"/g, `{'"'}`).replace(/\n/g, `{'\\n'}`),
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
          ` children=${escaped.join("")} /`,
        );
        content.remove(node.children[0].start, node.end);
        return components;
      }
    }
  }
  /**
   * @param {TemplateNode} child
   */
  function processChild(child) {
    replaceReactTags(child, content, components);
  }
  // traverse children & branching blocks
  node.children?.forEach(processChild);
  node.else?.children?.forEach(processChild);
  node.pending?.children?.forEach(processChild);
  node.then?.children?.forEach(processChild);
  node.catch?.children?.forEach(processChild);
  return components;
}
