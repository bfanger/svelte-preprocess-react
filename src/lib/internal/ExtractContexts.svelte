<script lang="ts">
  import { getAllContexts, untrack } from "svelte";

  type Props = {
    setContexts: (value: Map<any, any>) => void;
  };
  const { setContexts }: Props = $props();

  untrack(() => setContexts(getAllContexts()));
</script>
