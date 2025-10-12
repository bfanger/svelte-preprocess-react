<script lang="ts">
  import ClickerReact from "../../../tests/fixtures/Clicker";
  import AlertReact from "../../../demo/react-components/Alert";
  import CounterAsync from "./CounterAsync";
  import sveltifyAsync from "../sveltifyAsync";

  let count = $state(1);

  const Counter = sveltifyAsync(CounterAsync);
  const Clicker = sveltifyAsync(ClickerReact);
  const Alert = sveltifyAsync(AlertReact);
  const Div = sveltifyAsync("div");
</script>

<Counter initial={10} onCount={console.info} />

<Clicker
  {count}
  onCount={() => {
    count = Math.random();
  }}
/>
<Div className="react-div">
  <Alert type="primary">A simple alert</Alert>
</Div>
