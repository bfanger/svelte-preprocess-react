<script lang="ts">
  import { sveltify } from "svelte-preprocess-react";
  import ClickerReact from "../../tests/fixtures/Clicker";
  import AlertReact from "../../demo/react-components/Alert";
  import CounterReact from "../../demo/react-components/Counter";

  let count = $state(1);

  const Counter = sveltify(CounterReact);
  const Clicker = sveltify(ClickerReact);
  const Alert = sveltify(AlertReact);
</script>

<Counter initial={10} onCount={console.info} />

<Clicker
  {count}
  onCount={() => {
    count = Math.random();
  }}
/>

<Alert type="primary">A simple alert</Alert>
