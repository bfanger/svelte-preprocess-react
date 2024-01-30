import * as React from "react";
import useStore from "../useStore.js";
import SvelteToReactContext from "./SvelteToReactContext.js";
import Child from "./Child.js";
import type { TreeNode } from "./types";

export type BridgeProps = {
  node: TreeNode;
  createPortal?: (
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: null | string,
  ) => React.ReactPortal;
};
const Bridge: React.FC<BridgeProps> = ({ node, createPortal }) => {
  const props = { ...useStore(node.props) };
  props.key = "component";
  let { children } = props;
  delete props.children;
  const portalTarget = useStore(node.portalTarget);
  const childrenSource = useStore(node.childrenSource);
  const svelteChildren = useStore(node.svelteChildren);
  const hooks = useStore(node.hooks);
  const firstRender = React.useRef(true);

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
  if (node.nodes.length !== 0) {
    children = [
      children,
      ...node.nodes.map((subnode) =>
        React.createElement(Bridge, {
          key: `bridge${subnode.key}`,
          createPortal,
          node: subnode,
        }),
      ),
    ];
  }

  const vdom = React.createElement(
    SvelteToReactContext.Provider,
    { value: node },
    [
      children === undefined
        ? React.createElement(node.reactComponent, props)
        : React.createElement(node.reactComponent, props, children),

      ...hooks.map(({ Hook, key }) =>
        React.createElement(Hook, { key: `hook${key}` }),
      ),
    ],
  );
  if (portalTarget && createPortal) {
    if (firstRender.current) {
      firstRender.current = false;
      portalTarget.innerHTML = ""; // Remove injected SSR content
    }
    return createPortal(vdom, portalTarget);
  }

  return React.createElement(
    "react-portal-source",
    { node: node.key, style: { display: "none" } },
    vdom,
  );
};
export default Bridge;
