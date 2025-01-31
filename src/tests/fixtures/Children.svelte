<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  let { children }: Props = $props();
</script>

<div class="wrapper">
  {@render children()}
</div>

<style>
  .wrapper {
    margin: 1rem;
    padding: 2rem;
    border: 2px solid #108caf;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
