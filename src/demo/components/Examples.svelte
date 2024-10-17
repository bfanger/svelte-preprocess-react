<script lang="ts">
  import { createPortal } from "react-dom";
  import { renderToString } from "react-dom/server";
  import { sveltify } from "svelte-preprocess-react";
  import ClickerReact from "../../tests/fixtures/Clicker";
  import AlertReact from "../react-components/Alert";
  import CounterReact from "../react-components/Counter";
  import type { ReactDependencies } from "svelte-preprocess-react/internal/types";

  const { ReactDOM }: { ReactDOM: ReactDependencies["ReactDOM"] } = $props(); // The 'react-dom/client' import for React 18+, 'react-dom' for React 16 & 17

  let count = $state(1);

  const deps = { createPortal, ReactDOM, renderToString };

  const Counter = sveltify(CounterReact, deps);
  const Clicker = sveltify(ClickerReact, deps);
  const Alert = sveltify(AlertReact, deps);
</script>

<Counter initial={10} onCount={console.info} />

<Clicker
  {count}
  onCount={() => {
    count = Math.random();
  }}
/>

<Alert type="primary">A simple alert</Alert>
