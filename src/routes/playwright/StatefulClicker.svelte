<script lang="ts">
  import { createPortal } from "react-dom";
  import ClickerReact from "../../tests/fixtures/Clicker";
  import { sveltify } from "svelte-preprocess-react";

  type Props = { ReactDOM: any };
  const { ReactDOM }: Props = $props();
  const Clicker = sveltify(ClickerReact, createPortal, ReactDOM);

  let count = $state(0);

  function onCount(value: number) {
    count = value;
  }
</script>

<Clicker {count} {onCount} />
