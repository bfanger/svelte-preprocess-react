<script lang="ts">
  /**
   * Helper for sveltify()
   * - Render a placeholder where the React component can portal into.
   * - Render the Svelte children, that can be injected into the React component.
   */
  import {
    getAllContexts,
    getContext,
    onDestroy,
    setContext,
    type Snippet,
  } from "svelte";
  import type { FunctionComponent, ReactNode } from "react";
  import type { SvelteInit, TreeNode } from "./types";

  type Props = {
    svelteInit: (options: SvelteInit) => TreeNode;
    children?: Snippet;
    react$Children?: ReactNode;
  };
  let { svelteInit, children, react$Children, ...reactProps }: Props = $props();

  let portalTarget = $state<HTMLElement | undefined>();

  let childrenSource = $state<HTMLElement | undefined>();
  let hooks = $state<Array<{ Hook: FunctionComponent; key: number }>>([]);

  const parent = getContext<TreeNode | undefined>("ReactWrapper");
  const node = setContext(
    "ReactWrapper",
    svelteInit({
      parent,
      get props() {
        return {
          reactProps,
          children: react$Children as ReactNode,
        };
      },
      get portalTarget() {
        return portalTarget;
      },
      get childrenSource() {
        return childrenSource;
      },
      get svelteChildren() {
        return children;
      },
      get hooks() {
        return hooks;
      },
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
  bind:this={portalTarget}
></svelte-portal-target>

{#if children}
  <svelte-children-source
    node={node.key}
    style="display:none"
    bind:this={childrenSource}>{@render children()}</svelte-children-source
  >
{/if}
