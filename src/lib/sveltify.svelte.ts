import type ReactDOMServer from "react-dom/server";
import * as React from "react";
import type {
  ChildrenPropsAsSnippet,
  SvelteInit,
  Sveltified,
  TreeNode,
} from "./internal/types.js";
import Bridge, { type BridgeProps } from "./internal/Bridge.svelte.js";
import ReactWrapper from "./internal/ReactWrapper.svelte";
import { setPayload } from "./reactify.js";
import type { Component } from "svelte";

let sharedRoot: TreeNode | undefined;

export default function sveltify<
  T extends {
    [key: string]: React.JSXElementConstructor<any>;
  },
>(
  components: T,
  createPortal: BridgeProps["createPortal"],
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString,
): {
  [K in keyof T]: Sveltified<T[K]>;
};
/**
 * Convert a React component into a Svelte component.
 */
export default function sveltify<T extends React.JSXElementConstructor<any>>(
  components: T,
  createPortal: BridgeProps["createPortal"],
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString,
): Sveltified<T>;
export default function sveltify(
  components: any,
  createPortal: BridgeProps["createPortal"],
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString,
): any {
  if (
    typeof components === "function" ||
    ("render" in components && typeof components.render === "function") ||
    "_context" in components // a Context.Provider
  ) {
    return single(
      components as React.FC,
      createPortal,
      ReactDOMClient,
      renderToString,
    );
  }
  return multiple(components, createPortal, ReactDOMClient, renderToString);
}

function single<T extends React.FC | React.ComponentClass>(
  reactComponent: T,
  createPortal: BridgeProps["createPortal"],
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString,
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
  const client = typeof document !== "undefined";

  function Sveltified(anchorOrPayload: any, $$props: any) {
    const standalone = !sharedRoot;

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
          const root = ReactDOMClient.createRoot?.(rootEl);
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
            rootNode.rerender = () => {
              ReactDOMClient.render(
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

function multiple<
  T extends {
    [key: string]: React.FC | React.ComponentClass;
  },
>(
  reactComponents: T,
  createPortal: BridgeProps["createPortal"],
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString,
): {
  [K in keyof T]: Component<ChildrenPropsAsSnippet<React.ComponentProps<T[K]>>>;
} {
  return Object.fromEntries(
    Object.entries(reactComponents).map(([key, reactComponent]) => {
      return [
        key,
        single(reactComponent, createPortal, ReactDOMClient, renderToString),
      ];
    }),
  ) as any;
}
