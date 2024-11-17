import { useRef, useState, useEffect, createElement } from "react";
import type { ReactDependencies, TreeNode } from "./types.js";
import Child from "./Child.js";
import SvelteToReactContext from "./SvelteToReactContext.js";
import portalTag from "svelte-preprocess-react/internal/portalTag.js";

type BridgeProps = {
  node: TreeNode;
  createPortal?: ReactDependencies["createPortal"];
};
const Bridge: React.FC<BridgeProps> = ({ node, createPortal }) => {
  const fresh = useRef(false);
  const [result, setResult] = useState<React.ReactNode>(() =>
    renderBridge(node, createPortal, true),
  );
  useEffect(
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
      children = createElement(Child, {
        nodeKey: node.key,
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
        createElement(Bridge, {
          key: `bridge${subnode.key}`,
          createPortal,
          node: subnode,
        }),
      ),
      ...hooks.map(({ Hook, key }) =>
        createElement(Hook, { key: `hook${key}` }),
      ),
    ];
  }

  const vdom = createElement(
    SvelteToReactContext.Provider,
    { value: node },
    children === undefined
      ? createElement(node.reactComponent, props)
      : createElement(node.reactComponent, props, children),
  );
  if (portalTarget && createPortal) {
    if (initialRender) {
      portalTarget.innerHTML = ""; // Remove injected SSR content
    }
    return createPortal(vdom, portalTarget);
  }

  return createElement(
    portalTag("react", "portal", "source", node.key),
    { style: { display: "none" } },
    vdom,
  );
}
export default Bridge;
