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
  import portalTag from "svelte-preprocess-react/internal/portalTag";

  type Props = {
    svelteInit: (options: SvelteInit) => TreeNode;
    children?: Snippet;
    react$props?: any;
    react$children?: ReactNode;
    react$slotGroup?: any;
  };
  let {
    svelteInit,
    children,
    react$children,
    react$props,
    react$slotGroup,
    ...restProps
  }: Props = $props();

  let portalTarget = $state<HTMLElement | undefined>();

  let childrenSource = $state<HTMLElement | undefined>();
  const slotSources = $state<HTMLElement[]>([]);
  const hooks = $state<{ Hook: FunctionComponent; key: number }[]>([]);

  const slots: Snippet[] = [];

  for (const [name, snippet] of Object.entries(restProps)) {
    const match = /^react\$slot(\d+)$/.exec(name);
    if (match) {
      const i = Number(match[1]);
      slots[i] = snippet as Snippet;
    }
  }

  const parent = getContext<TreeNode | undefined>("ReactWrapper");
  const node = setContext(
    "ReactWrapper",
    svelteInit({
      parent,
      get props() {
        let reactProps = react$props ?? restProps;
        if (slots.length) {
          reactProps = Object.fromEntries(
            Object.entries(restProps).filter(
              ([name]) => !name.startsWith("react$slot"),
            ),
          );
        }
        return { reactProps, children: react$children };
      },
      get portalTarget() {
        return portalTarget;
      },
      get childrenSource() {
        return childrenSource;
      },
      get slotSources() {
        return slotSources;
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
    node.unroot?.();
  });
</script>

<svelte:element
  this={portalTag("svelte", "portal", "target", node.key)}
  style="display:contents"
  bind:this={portalTarget}
></svelte:element>

{#if children}
  <svelte:element
    this={portalTag("svelte", "children", "source", node.key)}
    style="display:none"
    bind:this={childrenSource}>{@render children()}</svelte:element
  >
{/if}

{#each slots as slot, i}
  <svelte:element
    this={portalTag("svelte", `slot${i}`, "source", node.key)}
    style="display:none;"
    bind:this={slotSources[i]}>{@render slot()}</svelte:element
  >
{/each}
