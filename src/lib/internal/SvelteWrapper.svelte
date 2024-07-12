<script lang="ts">
  import type { SvelteComponent as SvelteComponentType } from "svelte";
  import { createEventDispatcher, onMount, tick } from "svelte";

  const dispatch = createEventDispatcher();

  export let SvelteComponent: typeof SvelteComponentType;
  export let props: Record<string, any>;
  export let children: boolean;
  export let events: Record<string, any>;

  let slot: HTMLElement | undefined = undefined;
  let instance: any;
  $: if (instance) {
    syncEvents(events);
  }

  let offs: (() => void)[] = [];
  function syncEvents(listeners: Record<string, any>) {
    offs.forEach((off) => off());
    offs = [];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (listeners) {
      Object.entries(listeners).forEach(([event, listener]) => {
        offs.push(instance.$on(event, listener));
      });
    }
  }

  $: dispatch("svelte-slot", slot);
  onMount(async () => {
    await tick();
    dispatch("svelte-slot", slot);
  });
</script>

{#if children}
  <svelte:component this={SvelteComponent} bind:this={instance} {...props}
    ><svelte-slot bind:this={slot} /></svelte:component
  >
{:else}
  <svelte:component this={SvelteComponent} bind:this={instance} {...props} />
{/if}

<style>
  svelte-slot {
    display: contents;
  }
</style>
