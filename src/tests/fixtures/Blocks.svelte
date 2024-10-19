<script lang="ts">
  import type React from "react";

  const number = 1;

  const Component: React.FC = () => null;
  const react = sveltify({ Component });
</script>

<!-- eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -->
{#if number === 1}
  <react.Component />
  <!-- eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -->
{:else if number === 2}
  <react.Component />
{:else}
  <react.Component />
{/if}

{#each [] as _}
  <react.Component />
{:else}
  <react.Component />
{/each}

{#await Promise.resolve()}
  <react.Component />
{:then}
  <react.Component />
{:catch}
  <react.Component />
{/await}
