<script lang="ts">
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
  let portal: HTMLElement | undefined = $state(undefined);
  const target = writable<HTMLElement | undefined>();
  const slot = writable<HTMLElement | undefined>();
  const hooks = writable<Array<{ Hook: FunctionComponent; key: number }>>([]);

  $effect(() => {
    propsStore.set({ ...reactProps, children: react$Children });
  });

  const parent = getContext<TreeNode | undefined>("ReactWrapper");
  const node = setContext(
    "ReactWrapper",
    svelteInit({
      parent,
      props: propsStore,
      target,
      slot,
      hooks,
      contexts: getAllContexts(),
    }),
  );

  $effect(() => {
    if (portal) {
      portal.innerHTML = "";
      target.set(portal);
    }
  });

  onDestroy(() => {
    if (node.parent) {
      node.parent.nodes = node.parent.nodes.filter((n) => n !== node);
      node.rerender?.();
    }
  });
</script>

<react-portal-target sveltify={node.key} bind:this={portal} />

{#if children}
  <svelte-slot sveltify={node.key} bind:this={$slot}
    >{@render children()}</svelte-slot
  >
{/if}

<style>
  react-portal-target {
    display: contents;
  }
  svelte-slot {
    display: none;
  }
</style>
