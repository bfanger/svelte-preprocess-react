<script lang="ts">
  import { writable } from "svelte/store";
  import {
    beforeUpdate,
    getAllContexts,
    getContext,
    onDestroy,
    setContext,
  } from "svelte";
  import type { FunctionComponent } from "react";
  import type { SvelteInit, TreeNode } from "./types";

  export let svelteInit: (options: SvelteInit) => TreeNode;

  const props = writable<Record<string, any>>(extractProps($$props));
  const target = writable<HTMLElement | undefined>();
  const slot = writable<HTMLElement | undefined>();
  const hooks = writable<Array<{ Hook: FunctionComponent; key: number }>>([]);
  const listeners: Array<() => void> = [];

  const parent = getContext<TreeNode | undefined>("ReactWrapper");

  const node = svelteInit({
    parent,
    props,
    target,
    slot,
    hooks,
    contexts: getAllContexts(),
    onDestroy(callback) {
      listeners.push(callback);
    },
  });
  setContext("ReactWrapper", node);
  beforeUpdate(() => {
    props.set(extractProps($$props));
  });
  onDestroy(() => {
    listeners.forEach((callback) => callback());
  });
  function extractProps(values: Record<string, any>) {
    const { svelteInit: excluded, ...rest } = values;
    return rest;
  }
</script>

<react-portal-target bind:this={$target} />

{#if $$slots.default}
  <svelte-slot bind:this={$slot}><slot /></svelte-slot>
{/if}

<style>
  react-portal-target {
    display: contents;
  }
  svelte-slot {
    display: none;
  }
</style>
