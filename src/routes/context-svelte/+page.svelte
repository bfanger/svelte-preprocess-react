<script lang="ts">
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { renderToString } from "react-dom/server";
  import { setContext } from "svelte";
  import { reactify, sveltify } from "svelte-preprocess-react";
  import DebugContext from "../../demo/components/DebugContext.svelte";

  setContext("message", "Hello from svelte route");

  const svelte = reactify({ DebugContext });
  const react = sveltify(
    { DebugContext: svelte.DebugContext },
    { createPortal, ReactDOM, renderToString },
  );
</script>

<react.DebugContext id="message" />
