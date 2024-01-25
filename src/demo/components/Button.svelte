<script lang="ts">
  import type { Snippet } from "svelte";

  let { children, onClick } = $props<{
    children?: Snippet;
    onClick: () => void;
  }>();
</script>

<button onclick={onClick}>
  {#if children}{@render children()}{/if}
</button>

<style>
  button {
    border: none;
    border-radius: 0.4rem;
    background-color: #0f9c9c;
    color: white;
    margin: 0.3rem;
    cursor: pointer;
  }
</style>
