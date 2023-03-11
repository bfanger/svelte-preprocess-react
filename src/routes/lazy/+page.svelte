<script lang="ts">
  import { browser } from "$app/environment";
  import { used } from "$lib";
  import { lazy } from "react";

  const Counter = lazy(() => import("../../demo/react-components/Counter"));
  used(Counter);
</script>

{#if browser}
  <react:Counter />
{/if}
