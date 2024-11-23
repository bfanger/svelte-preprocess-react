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

function sveltify<
  T extends {
    [key: string]:
      | keyof JSX.IntrinsicElements
      | React.JSXElementConstructor<any>;
  },
>(
  components: T,
  dependencies?: ReactDependencies,
): {
  [K in keyof T]: Sveltified<T[K]> & StaticPropComponents;
} & IntrinsicElementComponents;
/**
 * Convert a React component into a Svelte component.
 */
function sveltify<
  T extends React.FC | React.ComponentClass | React.JSXElementConstructor<any>,
>(components: T, dependencies?: ReactDependencies): Sveltified<T>;
function sveltify(components: any, dependencies?: ReactDependencies): any {
  if (!dependencies) {
    throw new Error(
      "{ createPortal, ReactDOM } are not injected, check svelte.config.js for: `preprocess: [preprocessReact()],`",
    );
  }
  if (
    typeof components !== "object" || // React.FC or JSXIntrinsicElements
    ("render" in components && typeof components.render === "function") || // React.ComponentClass
    "_context" in components // a Context.Provider
  ) {
    return single(components as React.FC, dependencies);
  }
  return multiple(components, dependencies);
}

type CacheEntry = ReactDependencies & { Sveltified: unknown };
const cache = new WeakMap<any, CacheEntry>();
const intrinsicElementCache: Record<string, CacheEntry> = {};

function multiple<
  T extends {
    [key: string]: React.FC | React.ComponentClass;
  },
>(
  reactComponents: T,
  dependencies: ReactDependencies,
): {
  [K in keyof T]: Component<ChildrenPropsAsSnippet<React.ComponentProps<T[K]>>>;
} {
  return Object.fromEntries(
    Object.entries(reactComponents).map(([key, reactComponent]) => {
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
      } else {
        cache.set(reactComponent, entry);
      }
      return [key, entry.Sveltified];
    }),
  ) as any;
}

function single<T extends React.FC | React.ComponentClass>(
  reactComponent: T,
  dependencies: ReactDependencies,
): Component<ChildrenPropsAsSnippet<React.ComponentProps<T>>> {
  const client = typeof document !== "undefined";
  const { createPortal, ReactDOM, renderToString } = dependencies;
  if (
    typeof reactComponent !== "function" &&
    typeof reactComponent === "object" &&
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
            rootNode.rerender = () => {
              root.render(
                React.createElement(Bridge, { node: rootNode, createPortal }),
              );
            };
          } else {
            if (!("render" in ReactDOM)) {
              throw new Error("ReactDOM.render is required to use sveltify");
            }
            rootNode.rerender = () => {
              ReactDOM.render(
                React.createElement(Bridge, { node: rootNode, createPortal }),
                rootEl,
              );
            };
          }
        }
      }
      let parent = init.parent;
      if (!parent) {
        parent = sharedRoot as TreeNode;
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
            React.createElement(Bridge, { node: sharedRoot }),
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
  $$payload: { out: string },
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
  $$payload: { out: string },
  node: TreeNode,
  source: { html: string },
) {
  if (node.svelteChildren !== undefined) {
    const tag = portalTag("svelte", "children", "source", node.key);
    const child = extract(
      `<${tag}  style="display:none">`,
      `</${tag}>`,
      $$payload.out,
    );
    try {
      const reactTargetTag = portalTag("react", "children", "target", node.key);
      source.html = inject(
        `<${reactTargetTag} style="display:contents">`,
        `</${reactTargetTag}>`,
        child.innerHtml,
        source.html,
      );
    } catch {
      // The React component didn't render the children, the rendering of children can be conditional.
    }
  }
  try {
    const reactSourceTag = portalTag("react", "portal", "source", node.key);
    const portal = extract(
      `<${reactSourceTag} style="display:none">`,
      `</${reactSourceTag}>`,
      source.html,
    );

    source.html = portal.outerRemoved;
    const svelteTargetTag = portalTag("svelte", "portal", "target", node.key);
    $$payload.out = inject(
      `<${svelteTargetTag}  style="display:contents">`,
      `</${svelteTargetTag}>`,
      portal.innerHtml,
      $$payload.out,
    );
  } catch (err) {
    if (!node.parent) {
      throw err;
    }
    // Nested component didn't render, could be suspense or conditional rendering.
  }
}

function extract(open: string, close: string, html: string) {
  const start = html.indexOf(open);
  if (start === -1) {
    throw new Error(`Couldn't find ${open}`);
  }
  const end = html.indexOf(close, start);
  if (start === -1) {
    throw new Error(`Couldn't find ${close}`);
  }
  const innerHtml = html.substring(start + open.length, end);
  const outerRemoved =
    html.substring(0, start) + html.substring(end + close.length);

  return {
    innerHtml,
    outerRemoved,
  };
}

function inject(open: string, close: string, content: string, target: string) {
  const start = target.indexOf(open);
  if (start === -1) {
    throw new Error(`Couldn't find ${open}`);
  }
  const end = target.indexOf(close, start);
  if (start === -1) {
    throw new Error(`Couldn't find ${close}`);
  }
  return (
    target.substring(0, start + open.length) + content + target.substring(end)
  );
}
