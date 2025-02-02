import { useRef, useState, useEffect, createElement } from "react";
import type { ReactDependencies, TreeNode } from "./types.js";
import Child from "./Child.js";
import SvelteFirstContext from "./SvelteFirstContext.js";
import portalTag from "svelte-preprocess-react/internal/portalTag.js";

type BridgeProps = {
  node: TreeNode;
  createPortal: ReactDependencies["createPortal"];
  source?: "hooks";
};
const Bridge: React.FC<BridgeProps> = ({ node, createPortal, source }) => {
  const fresh = useRef(false);
  const mounted = useRef(false);
  const [result, setResult] = useState<React.ReactNode>(() => {
    return renderBridge(node, createPortal, mounted, source);
  });
  useEffect(
    () =>
      $effect.root(() => {
        $effect(() => {
          fresh.current = true;
          setResult(renderBridge(node, createPortal, mounted, source));
        });
      }),
    [],
  );
  if (fresh.current) {
    fresh.current = false;
    return result;
  }
  return renderBridge(node, createPortal, mounted, source);
};

function renderBridge(
  node: TreeNode,
  createPortal: BridgeProps["createPortal"],
  mounted: { current: boolean },
  source?: "hooks",
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
    SvelteFirstContext.Provider,
    { value: node },
    children === undefined
      ? createElement(node.reactComponent, props)
      : createElement(node.reactComponent, props, children),
  );
  if (portalTarget) {
    if (source !== "hooks" && mounted.current === false) {
      portalTarget.innerHTML = ""; // Remove injected SSR content
      mounted.current = true;
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
