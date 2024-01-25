<script lang="ts">
  import type { SvelteComponent as SvelteComponentType } from "svelte";

  // eslint-disable-next-line prefer-const
  let { SvelteComponent, props, reactChildren, setSlot } = $props<{
    SvelteComponent: typeof SvelteComponentType;
    props: Record<string, any>;
    reactChildren: boolean;
    setSlot: (slot: HTMLElement | undefined) => void;
  }>();

  let slot: HTMLElement | undefined = $state(undefined);

  $effect(() => {
    setSlot(slot);
  });
</script>

{#if reactChildren}
  <svelte:component this={SvelteComponent} {...props}
    ><svelte-slot bind:this={slot} /></svelte:component
  >
{:else}
  <svelte:component this={SvelteComponent} {...props} />
{/if}

<style>
  svelte-slot {
    display: contents;
  }
</style>
