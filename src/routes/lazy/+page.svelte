<script lang="ts">
  import { lazy } from "react";
  import { browser } from "$app/environment";
  import { used } from "svelte-preprocess-react";

  const Counter = lazy(() => import("../../demo/react-components/Counter"));
  used(Counter);
</script>

{#if browser}
  <react:Counter />
{/if}
