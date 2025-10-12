<script lang="ts" module>
  /**
   * (Failed) experiment to use a single react root, but problem remained, we were still getting the:
   *
   * `Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`
   */

  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const reactRoots = new Map<string, FC>();

  let autoKey = 0;
  let rerenderRoot: () => void = () => undefined;

  function SharedRoot() {
    const [, setRender] = useState<unknown>({});
    rerenderRoot = () => setRender({});
    const children = [];
    for (const [key, Child] of reactRoots.entries()) {
      children.push(createElement(Child, { key }));
    }
    return children;
  }

  if (typeof document !== "undefined") {
    const rootEl = document.createElement("sveltify-react-root");
    document.body.appendChild(rootEl);

    const reactRoot = createRoot(rootEl);
    reactRoot.render(createElement(SharedRoot));
  }
  // let appendElement
</script>

<script lang="ts">
  /**
   * Render a React component as a Svelte component.
   */
  import {
    createElement,
    memo,
    useLayoutEffect,
    useRef,
    useState,
    type FC,
  } from "react";
  import { onDestroy } from "svelte";
  import { createPortal } from "react-dom";
  import { createRoot } from "react-dom/client";

  const { react$component, react$children, children, ...props } = $props();

  let target = $state<HTMLElement>();
  let Child = $state<FC>();
  autoKey++;
  const key = `${Math.random().toString(36).slice(4)}_${autoKey}`;

  type Sync = { props: any; children: any; target: any };
  let sync = (_: Sync) => undefined;
  const SveltifiedRoot = memo(() => {
    const [render, setRender] = useState<Sync>({
      props,
      children: Child ? createElement(Child) : react$children,
      target,
    });
    sync = (x: Sync) => {
      setRender(x);
    };
    if (!render?.target) {
      return null;
    }
    return createPortal(
      createElement(react$component, render.props, render.children),
      render.target,
    );
  });

  reactRoots.set(key, SveltifiedRoot);
  rerenderRoot();

  $effect(() =>
    sync({
      props: { ...props },
      children: Child ? createElement(Child) : react$children,
      target,
    }),
  );

  onDestroy(() => {
    reactRoots.delete(key);
    rerenderRoot();
  });
</script>

{#if children}
  <svelte-children
    {@attach (el: HTMLElement) => {
      Child = () => {
        const ref = useRef<HTMLElement>(null);
        useLayoutEffect(() => {
          ref.current!.appendChild(el);
        }, []);
        return createElement("sveltify-react-child", { ref });
      };
    }}
  >
    {@render children()}
  </svelte-children>
{/if}
<sveltify-react-portal bind:this={target}></sveltify-react-portal>
