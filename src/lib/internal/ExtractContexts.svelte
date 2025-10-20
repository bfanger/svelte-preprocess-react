<script lang="ts">
  import { getAllContexts } from "svelte";

  type Props = {
    setContexts: (value: Map<any, any>) => void;
  };
  const { setContexts }: Props = $props();

  setContexts(getAllContexts());
</script>
