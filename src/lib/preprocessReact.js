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
const prefix = "inject$$";

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
  const components = replaceReactTags(ast.html, s, options.filename);
  const aliases = Object.entries(components);

  /** @type {Set<'sveltify' | 'hooks'>} */
  let imported = new Set();
  /** @type {Set<'sveltify' | 'hooks'>} */
  let used = new Set();
  let defined = false;
  /** @type {false|Set<string>} */
  let aliased = false;

  /**
   * Detect sveltify import and usage
   *
   * @param {import('estree-walker').Node} node
   * @param {import('estree-walker').Node|null} parent
   */
  function enter(node, parent) {
    if (node.type === "Identifier" && node.name === "sveltify" && parent) {
      if (
        parent.type === "ImportSpecifier" ||
        parent.type === "ImportDeclaration"
      ) {
        imported.add("sveltify");
      } else if (parent.type === "CallExpression") {
        if (
          parent?.arguments.length === 1 &&
          "end" in parent.arguments[0] &&
          typeof parent.arguments[0].end === "number"
        ) {
          s.appendRight(parent.arguments[0].end, `, { ${deps.join(", ")} }`);
        }

        const componentsArg = parent.arguments[0];
        if (!aliased && componentsArg.type === "ObjectExpression") {
          aliased = new Set();
          for (const property of componentsArg.properties) {
            if (property.type === "Property") {
              if (property.key.type === "Identifier") {
                aliased.add(property.key.name);
              }
            }
          }
          if ("end" in componentsArg && typeof componentsArg.end === "number") {
            for (const [alias, { expression }] of aliases) {
              if (!aliased.has(alias)) {
                s.appendRight(
                  componentsArg.end - 1,
                  `, ${alias}: ${expression === expression.toLowerCase() ? JSON.stringify(expression) : expression} `,
                );
              }
            }
          } else {
            console.warn("missing end in Node<ObjectExpression>");
          }
        }
        used.add("sveltify");
      }
    }

    if (node.type === "Identifier" && node.name === "hooks" && parent) {
      if (
        parent.type === "ImportSpecifier" ||
        parent.type === "ImportDeclaration"
      ) {
        imported.add("hooks");
      } else if (parent.type === "CallExpression") {
        if (
          parent?.arguments.length === 1 &&
          "end" in parent.arguments[0] &&
          typeof parent.arguments[0].end === "number"
        ) {
          s.appendRight(parent.arguments[0].end, `, { ${deps.join(", ")} }`);
        }
        used.add("hooks");
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
  if (used.size === 0 && aliases.length === 0) {
    return { code: content };
  }
  let declarators = [];
  if (
    !imported.has("sveltify") &&
    (used.has("sveltify") || aliases.length > 0)
  ) {
    declarators.push("sveltify");
  }
  if (!imported.has("hooks") && used.has("hooks")) {
    declarators.push("hooks");
  }
  if (declarators.length > 0) {
    imports.push(`import { ${declarators.join(", ")} } from "${packageName}";`);
  }
  const script = ast.instance || ast.module;
  let wrappers = [];
  if (!defined && aliases.length > 0) {
    wrappers.push(
      `const react = sveltify({ ${Object.entries(components)
        .map(([alias, { expression }]) => {
          if (expression !== alias) {
            return `${alias}: ${expression}`;
          }
          if (expression.toLowerCase() === expression) {
            return `${expression.match(/^[a-z]+$/) ? expression : JSON.stringify(expression)}: ${JSON.stringify(expression)}`;
          }
          return expression;
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
 * @param {string | undefined} filename
 * @param {Record<string, { dispatcher: boolean, expression: string }>} components
 */
function replaceReactTags(node, content, filename, components = {}) {
  if (
    (node.type === "Element" && node.name.startsWith("react:")) ||
    (node.type === "InlineComponent" && node.name.startsWith("react."))
  ) {
    let legacy = node.name.startsWith("react:");

    if (legacy) {
      let location = "";
      if (filename) {
        location += ` in ${filename}`;
      }
      if (node.start) {
        location += ` on line ${content.original.substring(0, node.start).split("\n").length}`;
      }
      console.warn(
        `'<${node.name}' syntax is deprecated, use '<react.${node.name.substring(6)}'${location}.\nhttps://github.com/bfanger/svelte-preprocess-react/blob/main/docs/migration-to-2.0.md\n`,
      );
    }
    const expression = node.name.slice(6).replace("[.].*", "");
    const alias =
      expression.indexOf(".") === -1
        ? expression
        : `${prefix}${expression.replace(/\./g, "$")}`;
    if (legacy || expression !== alias) {
      let tagPrefix = legacy ? "react:" : "react.";
      // Replace open tag with alias
      content.overwrite(
        node.start + 1,
        node.start + 7 + expression.length,
        `react.${alias}`,
      );

      if (content.slice(node.end - 2, node.end) !== `/>`) {
        // Replace closing tag with alias
        const fullTag = content.slice(node.start, node.end - 1);
        const whitespaceLength = fullTag.length - fullTag.trimEnd().length;
        const tagEnd = node.end - whitespaceLength - node.name.length - 1;
        if (content.slice(tagEnd - 2, tagEnd + 6) !== `</${tagPrefix}`) {
          console.warn(
            `Unexpected formatting of the closing tag of <${node.name}>`,
          );
        } else {
          content.overwrite(
            tagEnd,
            tagEnd + node.name.length,
            `react.${alias}`,
          );
        }
      }
    }

    if (!components[alias]) {
      components[alias] = { dispatcher: false, expression };
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
          components[alias].dispatcher = true;
        }
      }
    });
    if (node.children && !legacy) {
      if (node.children.length === 0) {
        const childrenProp =
          Array.isArray(node.attributes) &&
          node.attributes.find(
            (/** @type {any} */ attr) => attr.name === "children",
          );
        if (childrenProp) {
          // If children are passed as attribute, pass the value as-is to the react component.
          content.appendLeft(childrenProp.start, "react$"); // renames "children" to "react$children"
        }
      } else {
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
  }
  /**
   * @param {any} child
   */
  function processChild(child) {
    replaceReactTags(child, content, filename, components);
  }
  // traverse children & branching blocks
  node.children?.forEach(processChild);
  node.else?.children?.forEach(processChild);
  node.pending?.children?.forEach(processChild);
  node.then?.children?.forEach(processChild);
  node.catch?.children?.forEach(processChild);
  return components;
}
