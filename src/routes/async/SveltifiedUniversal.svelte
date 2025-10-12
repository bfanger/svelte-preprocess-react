<script lang="ts" module>
  let hydrated = false;
</script>

<script lang="ts">
  import { onMount, type Component } from "svelte";
  import SveltifiedCSR from "./SveltifiedCSR.svelte";
  import SveltifiedSSR from "./SveltifiedSSR.svelte";

  const props = $props();
  let Sveltified: Component<any> | undefined = $state(
    typeof document === "undefined"
      ? SveltifiedSSR
      : hydrated
        ? SveltifiedCSR
        : undefined,
  );

  onMount(() => {
    Sveltified = SveltifiedCSR;
    hydrated = true;
  });
</script>

{#if Sveltified}
  <Sveltified {...props} />
{/if}
