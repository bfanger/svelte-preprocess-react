<script lang="ts">
  import sveltifyReact from "$lib/sveltifyReact";
  import { createElement } from "react";
  import { renderToString } from "react-dom/server";
  import ClickerReact from "../../tests/fixtures/Clicker";
  import CounterReact from "../react-components/Counter";
  import AlertReact from "../react-components/Alert";

  let count = 1;
  export let ReactDOM: any; // The 'react-dom/client' import for React 18+, 'react-dom' for React 16 & 17

  const Counter = sveltifyReact(
    CounterReact,
    createElement,
    ReactDOM,
    renderToString
  );
  const Clicker = sveltifyReact(
    ClickerReact,
    createElement,
    ReactDOM,
    renderToString
  );
  const Alert = sveltifyReact(
    AlertReact,
    createElement,
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
