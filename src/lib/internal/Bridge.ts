import type React from "react";
import type { ReactElement, ReactPortal } from "react";
import useReadable from "../useReadable";
import SvelteToReactContext from "./SvelteToReactContext";
import SvelteSlot from "./SvelteSlot";
import type { TreeNode } from "./types";

export type BridgeProps = {
  createElement: typeof React.createElement;
  createPortal: (
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: null | string
  ) => ReactPortal;
  node: TreeNode;
};
const Bridge: React.FC<BridgeProps> = ({
  createElement,
  createPortal,
  node,
}) => {
  const target = useReadable(node.target);
  const props = useReadable(node.props);
  const slot = useReadable(node.slot);

  if (!target) {
    return null;
  }
  const children: ReactElement[] = node.nodes.map((subnode) => {
    return createElement(Bridge, {
      key: subnode.key,
      createElement,
      createPortal,
      node: subnode,
    });
  });
  if (slot) {
    children.push(createElement(SvelteSlot, { key: "svelte-slot", slot }));
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
