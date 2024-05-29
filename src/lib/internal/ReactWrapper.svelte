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
  import deepRead from "./deepRead";

  type Props = {
    svelteInit: (options: SvelteInit) => TreeNode;
    children?: Snippet;
    react$Children?: unknown;
  };
  let { svelteInit, children, react$Children, ...reactProps }: Props = $props();

  const propsStore = writable<Record<string, any>>({
    ...reactProps,
    children: react$Children,
  });
  const portalTarget = writable<HTMLElement | undefined>();
  const svelteChildren = writable<Snippet | undefined>(children);
  const childrenSource = writable<HTMLElement | undefined>();
  const hooks = writable<Array<{ Hook: FunctionComponent; key: number }>>([]);

  $effect(() => {
    propsStore.set({ ...reactProps, children: react$Children });
  });
  $effect(() => {
    svelteChildren.set(children);
  });

  const parent = getContext<TreeNode | undefined>("ReactWrapper");
  const node = setContext(
    "ReactWrapper",
    svelteInit({
      parent,
      props: propsStore,
      portalTarget,
      childrenSource,
      svelteChildren,
      hooks,
      context: getAllContexts(),
    }),
  );

  onDestroy(() => {
    if (node.parent) {
      node.parent.nodes = node.parent.nodes.filter((n: any) => n !== node);
      node.rerender?.();
    }
  });
</script>

<svelte-portal-target
  node={node.key}
  style="display:contents"
  bind:this={$portalTarget}
></svelte-portal-target>

{#if children}
  <svelte-children-source
    node={node.key}
    style="display:none"
    bind:this={$childrenSource}>{@render children()}</svelte-children-source
  >
{/if}
