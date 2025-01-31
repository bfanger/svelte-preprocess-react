<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  export let name: string;

  onMount(() => {
    dispatch("bark", "woof");
  });
</script>

<svelte-dog>{name}</svelte-dog>

<style>
  svelte-dog {
    display: inline-block;
    background: #a65c37;
    color: white;
    border-radius: 5rem 0 2rem 0;
    padding: 2rem;
    border: 4px solid #5dacdb;
  }
</style>
