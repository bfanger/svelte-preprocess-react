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
  let props = useStore(node.props);
  const portalTarget = useStore(node.portalTarget);
  const leaf = useStore(node.leaf);
  const svelteChildren = useStore(node.childrenSource);
  const hooks = useStore(node.hooks);

  let children: React.ReactElement[] | undefined;
  if (node.nodes.length === 0 && leaf && hooks.length === 0) {
    if (props.children) {
      children = props.children;
      props = { ...props };
      delete props.children;
    }
  } else {
    children = node.nodes.map((subnode) =>
      React.createElement(Bridge, {
        key: `bridge${subnode.key}`,
        createPortal,
        node: subnode,
      }),
    );
    if (props.children) {
      children.push(props.children);
      props = { ...props };
      delete props.children;
    }
    if (!leaf) {
      children.push(
        React.createElement(Child, {
          node: node.key,
          key: "svelte$Children",
          el: svelteChildren,
        }),
      );
    }
    if (hooks.length >= 0) {
      children.push(
        ...hooks.map(({ Hook, key }) =>
          React.createElement(Hook, { key: `hook${key}` }),
        ),
      );
    }
  }
  const vdom = React.createElement(
    SvelteToReactContext.Provider,
    { value: node },
    children === undefined
      ? React.createElement(node.reactComponent, props)
      : React.createElement(node.reactComponent, props, children),
  );
  if (portalTarget && createPortal) {
    return createPortal(vdom, portalTarget);
  }
  if (createPortal) {
    return null;
  }
  return React.createElement(
    "react-portal-source",
    { node: node.key, style: { display: "none" } },
    vdom,
  );
};
export default Bridge;
