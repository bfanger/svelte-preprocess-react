<script lang="ts">
  import { createEventDispatcher, onMount, tick } from "svelte";
  import type { SvelteConstructor } from "./types";

  const dispatch = createEventDispatcher();

  export let SvelteComponent: SvelteConstructor;
  export let props: Record<string, any>;
  export let events: Record<string, any>;

  let slot: HTMLElement | undefined = undefined;
  let instance: any;
  $: instance && syncEvents(events);

  let offs: Array<() => void> = [];
  function syncEvents(listeners: Record<string, any>) {
    offs.forEach((off) => off());
    offs = [];
    if (listeners) {
      Object.entries(listeners).forEach(([event, listener]) => {
        offs.push(instance.$on(event, listener));
      });
    }
  }

  $: dispatch("svelte-slot", slot);
  onMount(() => {
    tick().then(() => {
      dispatch("svelte-slot", slot);
    });
  });
</script>

<svelte:component this={SvelteComponent} bind:this={instance} {...props}
  ><svelte-slot bind:this={slot} /></svelte:component
>

<style>
  svelte-slot {
    display: contents;
  }
</style>
