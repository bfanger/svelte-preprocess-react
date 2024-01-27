<script lang="ts">
  import type { SvelteComponent as SvelteComponentType } from "svelte";

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  let { SvelteComponent, props, react$Children, setSlot } = $props<{
    SvelteComponent: typeof SvelteComponentType;
    props: Record<string, any>;
    react$Children: boolean;
    setSlot: (slot: HTMLElement | undefined) => void;
  }>();

  let slot: HTMLElement | undefined = $state(undefined);

  $effect(() => {
    setSlot(slot);
  });
</script>

{#if react$Children}
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
