<script lang="ts">
  import sveltify from "$lib/sveltify";
  import { createElement } from "react";
  import { renderToString } from "react-dom/server";
  import ClickerReact from "../../tests/fixtures/Clicker";
  import CounterReact from "../react-components/Counter";
  import AlertReact from "../react-components/Alert";
  import { createPortal } from "react-dom";

  let count = 1;
  export let ReactDOM: any; // The 'react-dom/client' import for React 18+, 'react-dom' for React 16 & 17

  const Counter = sveltify(
    CounterReact,
    createElement,
    createPortal,
    ReactDOM,
    renderToString
  );
  const Clicker = sveltify(
    ClickerReact,
    createElement,
    createPortal,
    ReactDOM,
    renderToString
  );
  const Alert = sveltify(
    AlertReact,
    createElement,
    createPortal,
    ReactDOM,
    renderToString
  );
</script>

<Counter initial={10} onCount={console.info} />

<Clicker
  {count}
  onCount={() => {
    count = Math.random();
  }}
/>

<Alert type="primary">A simple alert</Alert>
