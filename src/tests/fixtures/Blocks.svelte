<script lang="ts">
  import { used } from "svelte-preprocess-react";
  import type React from "react";

  const number = 1;

  const Component: React.FC = () => null;
  used(Component);
</script>

<!-- eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -->
{#if number === 1}
  <react:Component></react:Component>
  <!-- eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -->
{:else if number === 2}
  <react:Component></react:Component>
{:else}
  <react:Component></react:Component>
{/if}

{#each [] as _}
  <react:Component></react:Component>
{:else}
  <react:Component></react:Component>
{/each}

{#await Promise.resolve()}
  <react:Component></react:Component>
{:then}
  <react:Component></react:Component>
{:catch}
  <react:Component></react:Component>
{/await}
