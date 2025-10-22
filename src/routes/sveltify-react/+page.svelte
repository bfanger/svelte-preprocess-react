<script lang="ts">
  import { sveltify } from "svelte-preprocess-react";
  import Clicker from "../../tests/fixtures/Clicker";
  import Alert from "../../demo/react-components/Alert";
  import Counter from "../../demo/react-components/Counter";

  let count = $state(1);

  const react = sveltify({ Clicker, Alert, Counter });
</script>

<react.Counter initial={10} onCount={console.info} />

<react.Clicker
  {count}
  onCount={() => {
    count = Math.random();
  }}
/>

<react.Alert type="primary">A simple alert</react.Alert>
