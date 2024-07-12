import * as React from "react";
import type { TreeNode } from "./types.js";
import Child from "./Child.js";
import SvelteToReactContext from "./SvelteToReactContext.js";

export type BridgeProps = {
  node: TreeNode;
  createPortal?: (
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: null | string,
  ) => React.ReactPortal;
};
const Bridge: React.FC<BridgeProps> = ({ node, createPortal }) => {
  const fresh = React.useRef(false);
  const [result, setResult] = React.useState<React.ReactNode>(() =>
    renderBridge(node, createPortal, true),
  );
  React.useEffect(
    () =>
      $effect.root(() => {
        $effect(() => {
          fresh.current = true;
          setResult(renderBridge(node, createPortal, false));
        });
      }),
    [],
  );
  if (fresh.current) {
    fresh.current = false;
    return result;
  }
  return renderBridge(node, createPortal, false);
};

function renderBridge(
  node: TreeNode,
  createPortal: BridgeProps["createPortal"],
  initialRender: boolean,
) {
  let { children } = node.props;
  const props = { ...node.props.reactProps };
  delete props.children;
  const { portalTarget, svelteChildren, childrenSource, hooks } = node;

  if (svelteChildren) {
    if (!children) {
      children = React.createElement(Child, {
        node: node.key,
        key: "svelte$Children",
        el: childrenSource,
      });
    } else {
      console.warn("Can't have both React & Svelte children");
    }
  }
  if (node.nodes.length !== 0 || hooks.length !== 0) {
    children = [
      children,
      ...node.nodes.map((subnode) =>
        React.createElement(Bridge, {
          key: `bridge${subnode.key}`,
          createPortal,
          node: subnode,
        }),
      ),
      ...hooks.map(({ Hook, key }) =>
        React.createElement(Hook, { key: `hook${key}` }),
      ),
    ];
  }

  const vdom = React.createElement(
    SvelteToReactContext.Provider,
    { value: node },
    children === undefined
      ? React.createElement(node.reactComponent, props)
      : React.createElement(node.reactComponent, props, children),
  );
  if (portalTarget && createPortal) {
    if (initialRender) {
      portalTarget.innerHTML = ""; // Remove injected SSR content
    }
    return createPortal(vdom, portalTarget);
  }

  return React.createElement(
    "react-portal-source",
    { node: node.key, style: { display: "none" } },
    vdom,
  );
}
export default Bridge;
