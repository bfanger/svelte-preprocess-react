import type React from "react";
import { createElement } from "react";
import useReadable from "../useReadable.js";
import SvelteToReactContext from "./SvelteToReactContext.js";
import Child from "./Child.js";
import type { TreeNode } from "./types";

export type BridgeProps = {
  createPortal: (
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: null | string
  ) => React.ReactPortal;
  node: TreeNode;
};
const Bridge: React.FC<BridgeProps> = ({ createPortal, node }) => {
  const target = useReadable(node.target);
  let props = useReadable(node.props);
  const slot = useReadable(node.slot);

  if (!target) {
    return null;
  }
  const children: React.ReactElement[] = node.nodes.map((subnode) => {
    return createElement(Bridge, {
      key: subnode.key,
      createPortal,
      node: subnode,
    });
  });
  if (props.children) {
    children.push(props.children);
    props = { ...props };
    delete props.children;
  }
  if (slot) {
    children.push(createElement(Child, { key: "svelte-slot", el: slot }));
  }
  return createPortal(
    createElement(
      SvelteToReactContext.Provider,
      { value: node.svelteInstance },
      createElement(node.reactComponent, props, children)
    ),
    target
  );
};
export default Bridge;
