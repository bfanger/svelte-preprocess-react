<script lang="ts">
  import { sveltify } from "svelte-preprocess-react";
  import ClickerReact from "../../tests/fixtures/Clicker";

  const Clicker = sveltify(ClickerReact);

  let count = $state(0);

  function onCount(value: number) {
    count = value;
  }
</script>

<Clicker {count} {onCount} />
