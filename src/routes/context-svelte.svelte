<script lang="ts">
  import reactifySvelte from "$lib/reactifySvelte";

  import sveltifyReact from "$lib/sveltifyReact";
  import { createElement } from "react";
  import ReactDOM from "react-dom/client";
  import { setContext } from "svelte";
  import DebugContext from "../demo/components/DebugContext.svelte";

  setContext("message", "Hello from route");

  const DebugContextReact = reactifySvelte(DebugContext);
  const DebugContextReactSvelte = sveltifyReact(
    DebugContextReact,
    createElement,
    ReactDOM
  );
</script>

<DebugContextReactSvelte id="message" />
