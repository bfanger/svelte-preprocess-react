<script lang="ts">
  import type React from "react";

  const number = 1;

  const Component: React.FC = () => null;
</script>

{#if number === 1}
  <react:Component />
{:else if number === 2}
  <react:Component />
{:else}
  <react:Component />
{/if}

{#each [] as item}
  <react:Component />
{:else}
  <react:Component />
{/each}

{#await Promise.resolve()}
  <react:Component />
{:then}
  <react:Component />
{:catch}
  <react:Component />
{/await}
