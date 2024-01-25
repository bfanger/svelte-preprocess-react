<script lang="ts">
  import { renderToString } from "react-dom/server";
  import { createPortal } from "react-dom";
  import ClickerReact from "../../tests/fixtures/Clicker";
  import CounterReact from "../react-components/Counter";
  import AlertReact from "../react-components/Alert";
  import { sveltify } from "svelte-preprocess-react";

  const { ReactDOM } = $props(); // The 'react-dom/client' import for React 18+, 'react-dom' for React 16 & 17

  let count = $state(1);

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
