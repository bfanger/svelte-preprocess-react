<script lang="ts" module>
  let hydrated = $state(false);
</script>

<script lang="ts">
  import { onMount, type Component } from "svelte";
  import SveltifiedCSR from "./SveltifiedCSR.svelte";

  const props = $props();

  let Sveltified: Component<any> | undefined = $derived(
    typeof document === "object"
      ? hydrated
        ? SveltifiedCSR
        : undefined
      : (await import("./SveltifiedSSR.svelte")).default,
  );

  onMount(() => {
    hydrated = true;
  });
</script>

{#if Sveltified}
  <Sveltified {...props} />
{/if}

<style>
  :global(
    sveltify-csr-react-root,
    sveltify-csr-portal,
    sveltify-csr-children,
    sveltify-csr-react-child,
    sveltify-csr-nested-app
  ) {
    display: contents;
  }
</style>
