<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    snippet: Snippet;
  };
  let { snippet }: Props = $props();
</script>

{@render snippet()}
