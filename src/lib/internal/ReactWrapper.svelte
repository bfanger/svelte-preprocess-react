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

  // eslint-disable-next-line prefer-const
  let { svelteInit, children, ...reactProps } = $props<{
    svelteInit: (options: SvelteInit) => TreeNode;
    children?: Snippet;
  }>();

  const propsStore = writable<Record<string, any>>(reactProps);
  const target = writable<HTMLElement | undefined>();
  const slot = writable<HTMLElement | undefined>();
  const hooks = writable<Array<{ Hook: FunctionComponent; key: number }>>([]);
  const listeners: Array<() => void> = [];

  $effect(() => {
    propsStore.set({ ...reactProps });
  });

  const parent = getContext<TreeNode | undefined>("ReactWrapper");
  setContext(
    "ReactWrapper",
    svelteInit({
      parent,
      props: propsStore,
      target,
      slot,
      hooks,
      contexts: getAllContexts(),
      onDestroy(callback) {
        listeners.push(callback);
      },
    }),
  );

  onDestroy(() => {
    listeners.forEach((callback) => callback());
  });
</script>

<react-portal-target bind:this={$target} />

{#if children}
  <svelte-slot bind:this={$slot}>{@render children()}</svelte-slot>
{/if}

<style>
  react-portal-target {
    display: contents;
  }
  svelte-slot {
    display: none;
  }
</style>
