<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  export let name: string;

  onMount(() => {
    dispatch("bark", "woof");
  });
</script>

<svelte-dog>{name}</svelte-dog>
