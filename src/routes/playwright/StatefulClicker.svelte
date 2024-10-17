<script lang="ts">
  import { createPortal } from "react-dom";
  import { sveltify } from "svelte-preprocess-react";
  import ClickerReact from "../../tests/fixtures/Clicker";

  type Props = { ReactDOM: any };
  const { ReactDOM }: Props = $props();
  const Clicker = sveltify(ClickerReact, { createPortal, ReactDOM });

  let count = $state(0);

  function onCount(value: number) {
    count = value;
  }
</script>

<Clicker {count} {onCount} />
