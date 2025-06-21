<script lang="ts">
  import { onMount } from "svelte";

  const { children } = $props();
  onMount(() => {
    document.body.dataset.ssr = "spa";
  });
</script>

{@render children()}
