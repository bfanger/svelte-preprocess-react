<script lang="ts">
  import { sveltify } from "svelte-preprocess-react";
  import Clicker from "../../tests/fixtures/Clicker";

  const react = sveltify({ Clicker });

  let count = $state(0);

  function onCount(value: number) {
    count = value;
  }
</script>

<react.Clicker {count} {onCount} />
