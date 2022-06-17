<script lang="ts">
  import sveltifyReact18 from "$lib/sveltifyReact18";
  import ClickerReact from "../tests/fixtures/Clicker";
  import CounterReact from "../demo/react-components/Counter";
  import AlertReact from "../demo/react-components/Alert";

  let count = 1;
  const Counter = sveltifyReact18(CounterReact);
  const Clicker = sveltifyReact18(ClickerReact);
  const Alert = sveltifyReact18(AlertReact);
</script>

<Counter initial={10} onCount={console.info} />

<Clicker
  {count}
  onCount={() => {
    count = Math.random();
  }}
/>

<Alert type="primary">Hallo</Alert>
