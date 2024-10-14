<script lang="ts">
  import { lazy } from "react";
  import { used } from "svelte-preprocess-react";
  import { browser } from "$app/environment";

  const Counter = lazy(() => import("../../demo/react-components/Counter"));
  used(Counter);
</script>

{#if browser}
  <react:Counter></react:Counter>
{/if}
