<script lang="ts">
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { renderToString } from "react-dom/server";
  import { setContext } from "svelte";
  import { reactify, sveltify } from "svelte-preprocess-react";
  import DebugContext from "../../demo/components/DebugContext.svelte";

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
