import MagicString from "magic-string";
import { parse, preprocess } from "svelte/compiler";
import detectReactVersion from "./internal/detectReactVersion.js";
import { walk } from "estree-walker";

/**
 * @typedef {import("svelte/compiler").PreprocessorGroup} PreprocessorGroup
 * @typedef {import("svelte/compiler").Processed} Processed
 */

const defaults = /** @type {const} */ ({
  react: "auto",
  ssr: true,
});

/**
 * Svelte preprocessor to use convert <react:*> tags into Sveltified React components.
 *
 * Imports renderToString from 'react-dom/server' unless the `ssr` option is set to false.
 *
 * @param {{
 *   ssr?: boolean;
 *   react?: number | "auto";
 *   preprocess?: PreprocessorGroup | PreprocessorGroup[];
 * }} options
 * @returns {PreprocessorGroup}
 */
export default function preprocessReact(options = {}) {
  let react = options.react ?? defaults.react;
  const ssr = options.ssr ?? defaults.ssr;

  return {
    async markup({ content, filename }) {
      /** @type {Processed | undefined} */
      let preprocessed;
      if (options.preprocess) {
        preprocessed = await preprocess(content, options.preprocess, {
          filename,
        });

        content = preprocessed.code;
      }

      if (react === "auto") {
        react = await detectReactVersion();
      }
      const processed = transform(content, {
        filename,
        react,
        ssr,
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
    },
  };
}

/**
 * @param {string} content
 * @param {{
 *  filename?: string;
 *  react: number;
 *  ssr: boolean;
 * }} options
 * @returns
 */
function transform(content, options) {
  const prefix = "inject$$";
  /** @type {string} */
  let portal;
  const packageName = "svelte-preprocess-react";
  const imports = [];

  if (options.react >= 18) {
    imports.push(
      `import ${prefix}ReactDOM from "react-dom/client";`,
      `import { createPortal as ${prefix}createPortal} from "react-dom";`,
    );
    portal = `${prefix}createPortal`;
  } else {
    imports.push(`import ${prefix}ReactDOM from "react-dom";`);
    portal = `${prefix}createPortal: ${prefix}ReactDOM.createPortal`;
  }

  const deps = [portal, `${prefix}ReactDOM`];
  if (options.ssr) {
    imports.push(
      `import { renderToString as ${prefix}renderToString } from "react-dom/server";`,
    );
    deps.push(`${prefix}renderToString`);
  }

  const ast = parse(content, {
    filename: options.filename,
    modern: false,
  });
  const s = new MagicString(content, { filename: options.filename });
  const components = replaceReactTags(ast.html, s);
  const aliases = Object.entries(components);

  let depsInjected = false;
  let imported = false;
  let defined = false;

  /**
   * Detect sveltify import and usage
   *
   * @param {import('estree-walker').Node} node
   * @param {import('estree-walker').Node|null} parent
   */
  function enter(node, parent) {
    if (node.type === "Identifier" && node.name === "sveltify" && parent) {
      if (parent.type === "ImportSpecifier") {
        imported = true;
      }
      if (
        parent.type === "CallExpression" &&
        parent?.arguments.length === 1 &&
        "end" in parent.arguments[0] &&
        typeof parent.arguments[0].end === "number"
      ) {
        s.appendRight(parent.arguments[0].end, `, { ${deps.join(", ")} }`);
        depsInjected = true;
      }
      if (parent.type === "ImportDeclaration") {
        imported = true;
      }
    }
    if (
      node.type === "Identifier" &&
      node.name === "react" &&
      parent?.type === "VariableDeclarator"
    ) {
      defined = true;
    }
  }
  if (ast.module) {
    walk(ast.module, { enter });
  }
  if (ast.instance) {
    walk(ast.instance, { enter });
  }
  if (!depsInjected && aliases.length === 0) {
    return { code: content };
  }
  if ((depsInjected && !imported) || (!imported && !defined)) {
    imports.push(`import { sveltify } from "${packageName}";`);
  }
  const script = ast.instance || ast.module;
  let wrappers = [];
  if (!defined) {
    wrappers.push(
      `const react = sveltify({ ${Object.keys(components)
        .map((component) => {
          if (component.toLowerCase() === component) {
            return `${component.match(/^[a-z]+$/) ? component : JSON.stringify(component)}: ${JSON.stringify(component)}`;
          }
          return component;
        })
        .join(", ")} }, { ${deps.join(", ")} });`,
    );
  }

  if (Object.values(components).find((c) => c.dispatcher)) {
    imports.push(
      'import { createEventDispatcher as React$$createEventDispatcher } from "svelte";',
    );
    wrappers.push("const React$$dispatch = React$$createEventDispatcher();");
  }
  if (!script) {
    s.prepend(
      `<script>\n${imports.join(" ")}\n\n${wrappers.join(" ")}\n</script>\n\n`,
    );
  } else {
    /** @type {any} */
    const program = script.content;
    s.appendRight(program.end, `;${wrappers.join(" ")}`);
    s.appendRight(program.start, imports.join(" "));
  }
  return {
    code: s.toString(),
    map: s.generateMap(),
  };
}

/**
 * Replace react:* tags by injecting Sveltified versions of the React components.
 *
 * @param {any} node
 * @param {MagicString} content
 * @param {Record<string, { dispatcher: boolean }>} components
 */
function replaceReactTags(node, content, components = {}) {
  if (
    (node.type === "Element" && node.name.startsWith("react:")) ||
    (node.type === "InlineComponent" && node.name.startsWith("react."))
  ) {
    let legacy = node.name.startsWith("react:");
    if (legacy) {
      console.warn("'<react:*' syntax is deprecated, use '<react.*'");
      content.overwrite(node.start + 6, node.start + 7, ".");
      const tagEnd = node.end - node.name.length - 3;
      if (content.slice(tagEnd, tagEnd + 8) === `</react:`) {
        content.overwrite(tagEnd + 7, tagEnd + 8, ".");
      }
    }
    const identifier = node.name.slice(6).replace("[.].*", "");
    if (!components[identifier]) {
      components[identifier] = { dispatcher: false };
    }

    node.attributes.forEach((/** @type {any} */ attr) => {
      if (attr.type === "EventHandler") {
        const event = attr;
        const eventStart = event.start;
        if (event.modifiers.length > 0) {
          throw new Error(`event modifiers are not supported`);
        }
        if (event.expression !== null) {
          content.overwrite(
            eventStart,
            eventStart + 4,
            `on${event.name[0].toUpperCase()}`,
          );
        } else {
          content.overwrite(
            eventStart,
            eventStart + 3 + event.name.length,
            `on${
              event.name[0].toUpperCase() + event.name.substring(1)
            }={(e) => React$$dispatch(${JSON.stringify(event.name)}, e)}`,
          );
          components[identifier].dispatcher = true;
        }
      }
    });
    if (node.children && node.children.length > 0) {
      const isTextContent =
        node.children.filter(
          (/** @type {any} */ child) =>
            ["Text", "MustacheTag"].includes(child.type) === false,
        ).length === 0;
      /** @type {string[]} */
      const escaped = [];
      if (isTextContent) {
        // Convert text & expressions into a children prop.
        escaped.push('"');
        node.children.forEach((/** @type {any} */ child) => {
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
          ` react$children=${escaped.join("")} /`,
        );
        content.remove(node.children[0].start, node.end);
        return components;
      }
    }
  }
  /**
   * @param {any} child
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
