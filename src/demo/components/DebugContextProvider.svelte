<script lang="ts">
  import { setContext, type Snippet } from "svelte";

  type Props = {
    id: any;
    value: any;
    children?: Snippet;
  };
  let { id, value, children }: Props = $props();

  setContext(id, value);
</script>

{@render children?.()}
