<script lang="ts">
  import { getContext, untrack } from "svelte";

  type Props = {
    id: any;
  };
  let { id }: Props = $props();

  const context = getContext(untrack(() => id));
  const text = JSON.stringify(context);
</script>

<pre>{text}</pre>

<style>
  pre {
    background: #5d5d5d;
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
  }
</style>
