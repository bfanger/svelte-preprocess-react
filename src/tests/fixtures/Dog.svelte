<script lang="ts">
  import { onMount } from "svelte";

  type DogProps = {
    name: string;
    onbark?: (sound: string) => void;
  };
  let { name, onbark }: DogProps = $props();

  onMount(() => {
    onbark?.("woof");
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
