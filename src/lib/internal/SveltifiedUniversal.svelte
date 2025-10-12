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
