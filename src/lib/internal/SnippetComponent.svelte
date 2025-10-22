<script lang="ts">
  /**
   * Allows rendering a snippet outside of svelte using mount or render.
   */
  import type { Snippet } from "svelte";

  type Props = {
    snippet: Snippet;
  };
  let { snippet }: Props = $props();
</script>

{@render snippet()}
