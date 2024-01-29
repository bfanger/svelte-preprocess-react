<script lang="ts">
  /**
   * Helper for sveltify()
   * - Render a placeholder where the React component can portal into.
   * - Render the Svelte children, that can be injected into the React component.
   */
  import { writable } from "svelte/store";
  import {
    getAllContexts,
    getContext,
    onDestroy,
    setContext,
    type Snippet,
  } from "svelte";
  import type { FunctionComponent } from "react";
  import type { SvelteInit, TreeNode } from "./types";

  let { svelteInit, children, react$Children, ...reactProps } = $props<{
    svelteInit: (options: SvelteInit) => TreeNode;
    children?: Snippet;
    react$Children?: unknown;
  }>();

  const propsStore = writable<Record<string, any>>({
    ...reactProps,
    children: react$Children,
  });
  const portalTarget = writable<HTMLElement | undefined>();
  const leaf = writable<boolean>(typeof children === "undefined");
  const childrenSource = writable<HTMLElement | undefined>();
  const hooks = writable<Array<{ Hook: FunctionComponent; key: number }>>([]);

  $effect(() => {
    propsStore.set({ ...reactProps, children: react$Children });
    leaf.set(typeof children === "undefined");
  });

  const parent = getContext<TreeNode | undefined>("ReactWrapper");
  const node = setContext(
    "ReactWrapper",
    svelteInit({
      parent,
      props: propsStore,
      portalTarget,
      leaf,
      childrenSource,
      hooks,
      context: getAllContexts(),
    }),
  );

  onDestroy(() => {
    if (node.parent) {
      node.parent.nodes = node.parent.nodes.filter((n) => n !== node);
      node.rerender?.();
    }
  });

  function clearSSR(el: HTMLElement) {
    el.innerHTML = "";
  }
</script>

<svelte-portal-target
  node={node.key}
  style="display:contents"
  bind:this={$portalTarget}
  use:clearSSR
/>

{#if children}
  <svelte-children-source
    node={node.key}
    style="display:none"
    bind:this={$childrenSource}>{@render children()}</svelte-children-source
  >
{/if}
