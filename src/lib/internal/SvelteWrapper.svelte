<script lang="ts">
  /**
   * Helper for reactify()
   */
  import type React from "react";
  import type { Component } from "svelte";
  import ExtractContexts from "svelte-preprocess-react/internal/ExtractContexts.svelte";
  import portalTag from "svelte-preprocess-react/internal/portalTag";

  type Props = {
    SvelteComponent: Component;
    nodeKey: string;
    props: Record<string, any>;
    react$children?: React.ReactNode;
    setSlot?: (slot: HTMLElement | undefined) => void;
    setContexts?: (value: Map<any, any>) => void;
  };
  let {
    SvelteComponent,
    nodeKey,
    props,
    react$children,
    setSlot,
    setContexts,
  }: Props = $props();

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
        ></svelte-children>{/if}{#if setContexts}<ExtractContexts
          {setContexts}
        />{/if}</SvelteComponent
    >
  {/if}</svelte:element
>
