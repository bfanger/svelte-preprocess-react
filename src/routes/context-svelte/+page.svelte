<script lang="ts">
  import { setContext } from "svelte";
  import { reactify, sveltify } from "svelte-preprocess-react";
  import DebugContext from "../../demo/components/DebugContext.svelte";

  setContext("message", "Hello from svelte route");

  const svelte = reactify({ DebugContext });
  const react = sveltify({ DebugContext: svelte.DebugContext });
</script>

<react.DebugContext id="message" />
