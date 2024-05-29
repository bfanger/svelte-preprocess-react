<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children?: Snippet;
    onClick: () => void;
  };
  let { children, onClick }: Props = $props();
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
