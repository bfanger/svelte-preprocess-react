<script lang="ts">
  import { createPortal } from "react-dom";
  import { renderToString } from "react-dom/server";
  import { sveltify } from "svelte-preprocess-react";
  import ClickerReact from "../../tests/fixtures/Clicker";
  import AlertReact from "../react-components/Alert";
  import CounterReact from "../react-components/Counter";

  let count = 1;
  export let ReactDOM: any; // The 'react-dom/client' import for React 18+, 'react-dom' for React 16 & 17

  const Counter = sveltify(
    CounterReact,
    createPortal,
    ReactDOM,
    renderToString,
  );
  const Clicker = sveltify(
    ClickerReact,
    createPortal,
    ReactDOM,
    renderToString,
  );
  const Alert = sveltify(AlertReact, createPortal, ReactDOM, renderToString);
</script>

<Counter initial={10} onCount={console.info} />

<Clicker
  {count}
  onCount={() => {
    count = Math.random();
  }}
/>

<Alert type="primary">A simple alert</Alert>
