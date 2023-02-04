<script lang="ts">
  import { browser } from "$app/environment";
  import { used } from "$lib";
  import { lazy, Suspense } from "react";

  const Counter = lazy(() => import("../../demo/react-components/Counter"));
  used(Counter, Suspense);
</script>

{#if browser}
  <react:Counter />
{/if}
