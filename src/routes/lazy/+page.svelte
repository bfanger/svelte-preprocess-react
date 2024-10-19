<script lang="ts">
  import { lazy } from "react";
  import { browser } from "$app/environment";

  const Counter = lazy(() => import("../../demo/react-components/Counter"));
  const react = sveltify({ Counter });
</script>

{#if browser}
  <react.Counter />
{/if}
