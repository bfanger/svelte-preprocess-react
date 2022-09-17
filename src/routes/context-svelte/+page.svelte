<script lang="ts">
  import { reactify, sveltify } from "$lib";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { setContext } from "svelte";
  import DebugContext from "../../demo/components/DebugContext.svelte";

  setContext("message", "Hello from svelte route");

  const DebugContextReact = reactify(DebugContext);
  const DebugContextReactSvelte = sveltify(
    DebugContextReact,
    createPortal,
    ReactDOM
  );
</script>

<DebugContextReactSvelte id="message" />
