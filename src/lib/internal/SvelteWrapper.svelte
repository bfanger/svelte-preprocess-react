<script lang="ts">
  /**
   * Helper for reactify()
   */
  import type React from "react";
  import type { Component } from "svelte";
  import portalTag from "svelte-preprocess-react/internal/portalTag";

  type Props = {
    SvelteComponent: Component;
    nodeKey: string;
    props: Record<string, any>;
    react$children?: React.ReactNode;
    setSlot?: (slot: HTMLElement | undefined) => void;
  };
  let { SvelteComponent, nodeKey, props, react$children, setSlot }: Props =
    $props();

  (globalThis as any).$$reactifySetProps = (update: Record<string, any>) => {
    props = update;
  };

  function slot(el: HTMLElement) {
    setSlot?.(el);
    return {
      destroy() {
        setSlot?.(undefined);
      },
    };
  }
</script>

<svelte:element
  this={portalTag("svelte", "portal", "source", nodeKey)}
  style="display:contents"
  >{#if typeof react$children === "undefined"}
    <SvelteComponent {...props} />
  {:else}
    <SvelteComponent {...props}
      >{#if typeof react$children === "string"}{react$children}{:else}<svelte-children
          node={nodeKey}
          style="display:contents"
          use:slot
        ></svelte-children>{/if}</SvelteComponent
    >
  {/if}</svelte:element
>
