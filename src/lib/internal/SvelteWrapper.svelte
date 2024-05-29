<script lang="ts">
  /**
   * Helper for reactify()
   */
  import type React from "react";
  import type { SvelteComponent as SvelteComponentType } from "svelte";

  type Props = {
    SvelteComponent: typeof SvelteComponentType;
    nodeKey: string;
    props: Record<string, any>;
    react$Children?: React.ReactNode;
    setSlot?: (slot: HTMLElement | undefined) => void;
  };
  let { SvelteComponent, nodeKey, props, react$Children, setSlot }: Props =
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    $props();

  // eslint-disable-next-line no-undef
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

<svelte-portal-source node={nodeKey} style="display:contents"
  >{#if typeof react$Children === "undefined"}
    <svelte:component this={SvelteComponent} {...props} />
  {:else}
    <svelte:component this={SvelteComponent} {...props}
      >{#if typeof react$Children === "string"}{react$Children}{:else}<svelte-children
          node={nodeKey}
          style="display:contents"
          use:slot
        ></svelte-children>{/if}</svelte:component
    >
  {/if}</svelte-portal-source
>
