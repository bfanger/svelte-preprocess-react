<script lang="ts">
  import ReactDOM from "react-dom";
  import Examples from "../../demo/components/Examples.svelte";
  import type { ReactDependencies } from "svelte-preprocess-react/internal/types";
</script>

<Examples ReactDOM={ReactDOM as any as ReactDependencies["ReactDOM"]} />
