import * as React from "react";
import type {
  ChildrenPropsAsSnippet,
  IntrinsicElementComponents,
  ReactDependencies,
  StaticPropComponents,
  SvelteInit,
  Sveltified,
  TreeNode,
} from "./internal/types.js";
import Bridge from "./internal/Bridge.svelte.js";
import ReactWrapper from "./internal/ReactWrapper.svelte";
import { setPayload } from "./reactify.js";
import type { Component } from "svelte";
import portalTag from "svelte-preprocess-react/internal/portalTag.js";

let sharedRoot: TreeNode | undefined;

export default sveltify;

type Dependencies = Omit<ReactDependencies, "flushSync">;

function sveltify<
  T extends Record<
    string,
    keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>
  >,
>(
  components: T,
  dependencies?: Dependencies,
): {
  [K in keyof T]: Sveltified<T[K]> & StaticPropComponents;
} & IntrinsicElementComponents;
/**
 * Convert a React components into Svelte components.
 */
function sveltify<
  T extends React.FC | React.ComponentClass | React.JSXElementConstructor<any>,
>(components: T, dependencies?: Dependencies): Sveltified<T>;
function sveltify(components: any, dependencies?: Dependencies): any {
  if (!dependencies) {
    throw new Error(
      "{ createPortal, ReactDOM } are not injected, check svelte.config.js for: `preprocess: [preprocessReact()],`",
    );
  }
  if (
    typeof components !== "object" || // React.FC or JSXIntrinsicElements
    ("render" in components && typeof components.render === "function") || // React.ComponentClass
    "_context" in components || // a Context.Provider
    ("Provider" in components && components.Provider === components) // a React 19 Context.Provider
  ) {
    return single(components as React.FC, dependencies);
  }
  return multiple(components, dependencies);
}

type CacheEntry = Dependencies & { Sveltified: unknown };
const cache = new WeakMap<any, CacheEntry>();
const intrinsicElementCache: Record<string, CacheEntry> = {};

function multiple<T extends Record<string, React.FC | React.ComponentClass>>(
  reactComponents: T,
  dependencies: Dependencies,
): {
  [K in keyof T]: Component<ChildrenPropsAsSnippet<React.ComponentProps<T[K]>>>;
} {
  return Object.fromEntries(
    Object.entries(reactComponents).map(([key, reactComponent]) => {
      if (reactComponent === undefined) {
        return [key, undefined];
      }
      const hit =
        typeof reactComponent === "string"
          ? intrinsicElementCache[reactComponent]
          : cache.get(reactComponent);
      if (
        hit &&
        hit.createPortal === dependencies.createPortal &&
        hit.ReactDOM === dependencies.ReactDOM &&
        hit.renderToString === dependencies.renderToString
      ) {
        return [key, hit.Sveltified];
      }
      const entry = {
        ...dependencies,
        Sveltified: single(reactComponent, dependencies),
      };
      if (typeof reactComponent === "string") {
        intrinsicElementCache[reactComponent] = entry;
      } else if (typeof reactComponent === "function") {
        cache.set(reactComponent, entry);
      }
      return [key, entry.Sveltified];
    }),
  ) as any;
}

function single<T extends React.FC | React.ComponentClass>(
  reactComponent: T,
  dependencies: Dependencies,
): Component<ChildrenPropsAsSnippet<React.ComponentProps<T>>> {
  const client = typeof document !== "undefined";
  const { createPortal, ReactDOM, renderToString } = dependencies;
  if (
    typeof reactComponent !== "function" &&
    typeof reactComponent === "object" &&
    reactComponent !== null &&
    "default" in reactComponent &&
    typeof (reactComponent as any).default === "function"
  ) {
    // Fix SSR import issue where node doesn't import the esm version. 'react-youtube'
    reactComponent = (reactComponent as any).default;
  }

  function Sveltified(anchorOrPayload: any, $$props: any) {
    let standalone = !sharedRoot;

    $$props.svelteInit = (init: SvelteInit) => {
      let unroot: undefined | (() => void);
      if (!init.parent && !sharedRoot) {
        let portalTarget = $state<HTMLElement | undefined>();
        const hooks = $state<{ Hook: React.FunctionComponent; key: number }[]>(
          [],
        );
        const rootNode: TreeNode = {
          key:
            typeof anchorOrPayload.anchor === "undefined"
              ? "/"
              : `${anchorOrPayload.anchor}-${anchorOrPayload.out.length}/}`,
          autoKey: 0,
          reactComponent: ({ children }: any) => children as React.ReactNode,
          get portalTarget() {
            return portalTarget;
          },
          props: { reactProps: {}, children: null },
          childrenSource: undefined,
          slotSources: [],
          svelteChildren: undefined,
          nodes: [],
          context: new Map(),
          get hooks() {
            return hooks;
          },
        };
        sharedRoot = rootNode;
        if (!client) {
          unroot = () => {
            sharedRoot = undefined;
          };
          void Promise.resolve().then(() => {
            if (sharedRoot === rootNode) {
              console.warn("unroot() was not called, did rendering fail?");
              sharedRoot = undefined;
            }
          });
        }
        if (client) {
          const rootEl = document.createElement("react-root");
          const root =
            "createRoot" in ReactDOM ? ReactDOM.createRoot(rootEl) : undefined;
          portalTarget = document.createElement("bridge-root");
          document.head.appendChild(rootEl);
          document.head.appendChild(portalTarget);

          if (root) {
            rootNode.rerender = (source) => {
              root.render(
                React.createElement(Bridge, {
                  node: rootNode,
                  createPortal,
                  source,
                }),
              );
            };
          } else {
            if (!("render" in ReactDOM)) {
              throw new Error("ReactDOM.render is required to use sveltify");
            }
            rootNode.rerender = (source) => {
              ReactDOM.render(
                React.createElement(Bridge, {
                  node: rootNode,
                  createPortal,
                  source,
                }),
                rootEl,
              );
            };
          }
        }
      }
      let parent = init.parent;
      if (!parent) {
        parent = sharedRoot!;
        standalone = true;
      }
      parent.autoKey += 1;
      const key = `${parent.key}${parent.autoKey}/`;
      const node: TreeNode = Object.assign(init, {
        key,
        autoKey: 0,
        reactComponent,
        nodes: [],
        rerender: parent.rerender,
        unroot,
      });
      parent.nodes.push(node);
      if (client) {
        parent.rerender?.();
      }
      return node;
    };

    (ReactWrapper as any)(anchorOrPayload, $$props);

    if (standalone && !client) {
      let renderError: Error | undefined;
      if (renderToString && sharedRoot) {
        setPayload(anchorOrPayload);
        try {
          const html = renderToString(
            React.createElement(Bridge, { node: sharedRoot, createPortal }),
          );
          const source = { html };
          applyPortals(anchorOrPayload, sharedRoot, source);
        } catch (err) {
          renderError = (err as Error) ?? new Error("Unknown error");
          sharedRoot = undefined;
        }
        setPayload(undefined);
        if (renderError) {
          throw renderError;
        }
      }
    }
  }

  return Sveltified as any;
}

/**
 * Merge output rendered by React into the correct place of the html.
 * (Mutates target and source objects)
 */
function applyPortals(
  $$payload: { out: string[] },
  node: TreeNode,
  source: { html: string },
) {
  node.nodes.forEach((subnode) => applyPortals($$payload, subnode, source));
  if (node === sharedRoot) {
    return;
  }
  applyPortal($$payload, node, source);
}

function applyPortal(
  $$payload: { out: string[] },
  node: TreeNode,
  source: { html: string },
) {
  if (node.svelteChildren !== undefined) {
    const child = extract(
      portalTag("svelte", "children", "source", node.key),
      $$payload.out,
    );
    try {
      source.html = inject(
        portalTag("react", "children", "target", node.key),
        child.innerHtml,
        source.html,
      );
    } catch {
      // The React component didn't render the children, the rendering of children can be conditional.
    }
  }
  try {
    const portal = extract(
      portalTag("react", "portal", "source", node.key),
      source.html,
    );

    source.html = portal.outerRemoved;
    $$payload.out = [
      inject(
        portalTag("svelte", "portal", "target", node.key),
        portal.innerHtml,
        $$payload.out,
      )
    ];
  } catch (err) {
    if (!node.parent) {
      throw err;
    }
    // Nested component didn't render, could be suspense or conditional rendering.
  }
}

function extract(tag: string, html: string | string[]) {
  const _html = Array.isArray(html) ? html.join("") : html;
  const open = `<${tag}`;
  const close = `</${tag}>`;
  const position = _html.indexOf(open);
  if (position === -1) {
    throw new Error(`Couldn't find '${open}'`);
  }
  const start = _html.indexOf(">", position + open.length) + 1;
  const end = _html.indexOf(close, start);
  if (end === -1) {
    throw new Error(`Couldn't find '${close}'`);
  }
  const innerHtml = _html.substring(start, end);
  const outerRemoved =
    _html.substring(0, start) + _html.substring(end + close.length);

  return {
    innerHtml,
    outerRemoved,
  };
}

function inject(tag: string, content: string, target: string | string[]) {
  const _target = Array.isArray(target) ? target.join("") : target;
  const open = `<${tag}`;
  const close = `</${tag}>`;
  const position = _target.indexOf(open);
  if (position === -1) {
    throw new Error(`Couldn't find ${open}`);
  }
  const start = _target.indexOf(">", position + open.length) + 1;

  const end = _target.indexOf(close, start);
  if (position === -1) {
    throw new Error(`Couldn't find ${close}`);
  }

  return _target.substring(0, start) + content + _target.substring(end);
}
