<script lang="ts">
  import SveltifiedCSR from "./SveltifiedCSR.svelte";

  const props = $props();

  let SveltifiedSSR = $derived(
    typeof document === "undefined" &&
      (await import("./SveltifiedSSR.svelte")).default,
  );
</script>

{#if SveltifiedSSR}
  <SveltifiedSSR {...props} />
{:else}
  <SveltifiedCSR {...props} />
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
