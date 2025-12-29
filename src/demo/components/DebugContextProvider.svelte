<script lang="ts">
  import { setContext, untrack, type Snippet } from "svelte";

  type Props = {
    id: any;
    value: any;
    children?: Snippet;
  };
  let { id, value, children }: Props = $props();

  setContext(
    untrack(() => id),
    untrack(() => value),
  );
</script>

{@render children?.()}
