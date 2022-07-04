<script lang="ts">
  import reactify from "$lib/reactify";
  import sveltify from "$lib/sveltify";
  import { createElement } from "react";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { setContext } from "svelte";
  import DebugContext from "../demo/components/DebugContext.svelte";

  setContext("message", "Hello from svelte route");

  const DebugContextReact = reactify(DebugContext);
  const DebugContextReactSvelte = sveltify(
    DebugContextReact,
    createElement,
    createPortal,
    ReactDOM
  );
</script>

<DebugContextReactSvelte id="message" />
