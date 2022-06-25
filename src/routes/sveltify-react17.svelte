<script lang="ts">
  import sveltifyReact from "$lib/sveltifyReact";
  import { createElement } from "react";
  import ReactDOM from "react-dom/client";
  import { renderToString } from "react-dom/server";
  import ClickerReact from "../tests/fixtures/Clicker";
  import CounterReact from "../demo/react-components/Counter";
  import AlertReact from "../demo/react-components/Alert";

  let count = 1;

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

<Alert type="primary">Hallo</Alert>
