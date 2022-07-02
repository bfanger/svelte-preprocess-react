<script lang="ts">
  import reactifySvelte from "$lib/reactifySvelte";

  import sveltifyReact from "$lib/sveltifyReact";
  import { createElement } from "react";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { setContext } from "svelte";
  import DebugContext from "../demo/components/DebugContext.svelte";

  setContext("message", "Hello from svelte route");

  const DebugContextReact = reactifySvelte(DebugContext);
  const DebugContextReactSvelte = sveltifyReact(
    DebugContextReact,
    createElement,
    createPortal,
    ReactDOM
  );
</script>

<DebugContextReactSvelte id="message" />
