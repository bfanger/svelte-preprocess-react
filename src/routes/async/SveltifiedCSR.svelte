<script lang="ts">
  /**
   * Render a React component as a Svelte component.
   */
  import { createElement, useLayoutEffect, useRef, type FC } from "react";
  import { onDestroy } from "svelte";
  import { createRoot } from "react-dom/client";
  import { createPortal } from "react-dom";

  const { react$component, react$children, children, ...props } = $props();

  let target = $state<HTMLElement>();
  let Child = $state<FC>();

  const rootEl = document.createElement("sveltify-react-root");
  const reactRoot = createRoot(rootEl);
  document.body.appendChild(rootEl);

  onDestroy(() => {
    reactRoot.unmount();
  });

  $effect(() => {
    if (!target) {
      return;
    }
    reactRoot.render(
      createPortal(
        createElement(
          react$component,
          props,
          Child ? createElement(Child) : react$children,
        ),
        target,
      ),
    );
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
