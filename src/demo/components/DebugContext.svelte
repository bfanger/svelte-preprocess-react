<script lang="ts">
  import { getContext } from "svelte";

  export let id: any;

  const context = getContext(id);
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
