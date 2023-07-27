<script lang="ts">
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { renderToString } from "react-dom/server";
  import { setContext } from "svelte";
  import DebugContext from "../../demo/components/DebugContext.svelte";
  import { reactify, sveltify } from "$lib";

  setContext("message", "Hello from svelte route");

  const DebugContextReact = reactify(DebugContext);
  const DebugContextReactSvelte = sveltify(
    DebugContextReact,
    createPortal,
    ReactDOM,
    renderToString,
  );
</script>

<DebugContextReactSvelte id="message" />
