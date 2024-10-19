import * as React from "react";
import type {
  ChildrenPropsAsSnippet,
  ReactDependencies,
  SvelteInit,
  Sveltified,
  TreeNode,
} from "./internal/types.js";
import Bridge from "./internal/Bridge.svelte.js";
import ReactWrapper from "./internal/ReactWrapper.svelte";
import { setPayload } from "./reactify.js";
import type { Component } from "svelte";

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
  [K in keyof T]: Sveltified<T[K]>;
};
/**
 * Convert a React component into a Svelte component.
 */
function sveltify<
  T extends React.FC | React.ComponentClass | React.JSXElementConstructor<any>,
>(components: T, dependencies?: ReactDependencies): Sveltified<T>;
function sveltify(components: any, dependencies?: ReactDependencies): any {
  if (
    typeof components !== "object" || // React.FC or JSXIntrinsicElements
    ("render" in components && typeof components.render === "function") || // React.ComponentClass
    "_context" in components // a Context.Provider
  ) {
    return single(components as React.FC, dependencies);
  }
  return multiple(components, dependencies);
}

function multiple<
  T extends {
    [key: string]: React.FC | React.ComponentClass;
  },
>(
  reactComponents: T,
  dependencies?: ReactDependencies,
): {
  [K in keyof T]: Component<ChildrenPropsAsSnippet<React.ComponentProps<T[K]>>>;
} {
  return Object.fromEntries(
    Object.entries(reactComponents).map(([key, reactComponent]) => {
      return [key, single(reactComponent, dependencies)];
    }),
  ) as any;
}

function single<T extends React.FC | React.ComponentClass>(
  reactComponent: T,
  dependencies: ReactDependencies = {},
): Component<ChildrenPropsAsSnippet<React.ComponentProps<T>>> {
  if (
    typeof reactComponent !== "function" &&
    typeof reactComponent === "object" &&
    "default" in reactComponent &&
    typeof (reactComponent as any).default === "function"
  ) {
    // Fix SSR import issue where node doesn't import the esm version. 'react-youtube'
    reactComponent = (reactComponent as any).default;
  }
  let { createPortal, ReactDOM, renderToString } = dependencies;
  if ("inject$$createPortal" in dependencies) {
    createPortal =
      dependencies.inject$$createPortal as ReactDependencies["createPortal"];
  }
  if ("inject$$ReactDOM" in dependencies) {
    ReactDOM = dependencies.inject$$ReactDOM as ReactDependencies["ReactDOM"];
  }
  if ("inject$$renderToString" in dependencies) {
    renderToString =
      dependencies.inject$$renderToString as ReactDependencies["renderToString"];
  }

  const client = typeof document !== "undefined";

  function Sveltified(anchorOrPayload: any, $$props: any) {
    const standalone = !sharedRoot;
    if (!createPortal || !ReactDOM) {
      throw new Error("createPortal & ReactDOM dependencies are required");
    }

    $$props.svelteInit = (init: SvelteInit) => {
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
      const parent = init.parent ?? (sharedRoot as TreeNode);
      parent.autoKey += 1;
      const key = `${parent.key}${parent.autoKey}/`;
      const node: TreeNode = Object.assign(init, {
        key,
        autoKey: 0,
        reactComponent,
        nodes: [],
        rerender: parent.rerender,
      });
      parent.nodes.push(node);
      if (client) {
        parent.rerender?.();
      }
      return node;
    };

    (ReactWrapper as any)(anchorOrPayload, $$props);

    if (standalone && !client) {
      if (renderToString && sharedRoot) {
        setPayload(anchorOrPayload);
        const html = renderToString(
          React.createElement(Bridge, { node: sharedRoot }),
        );
        const source = { html };
        applyPortals(anchorOrPayload, sharedRoot, source);
        setPayload(undefined);
      }
      sharedRoot = undefined;
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
    const child = extract(
      `<svelte-children-source node="${node.key}" style="display:none">`,
      `</svelte-children-source>`,
      $$payload.out,
    );
    try {
      source.html = inject(
        `<react-children-target node="${node.key}" style="display:contents">`,
        "</react-children-target>",
        child.innerHtml,
        source.html,
      );
    } catch {
      // The React component, didn't render the childrenThe rendering of children can be conditional.
    }
  }
  const portal = extract(
    `<react-portal-source node="${node.key}" style="display:none">`,
    `</react-portal-source>`,
    source.html,
  );

  source.html = portal.outerRemoved;
  try {
    $$payload.out = inject(
      `<svelte-portal-target node="${node.key}" style="display:contents">`,
      "</svelte-portal-target>",
      portal.innerHtml,
      $$payload.out,
    );
  } catch (err: any) {
    console.warn(err.message);
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
