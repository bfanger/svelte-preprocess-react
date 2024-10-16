<script lang="ts">
  import Counter from "../../demo/react-components/Counter";
  import Alert from "../../demo/react-components/Alert";
  import { sveltify } from "svelte-preprocess-react";
  import ReactDOM from "react-dom/client";
  import { createPortal } from "react-dom";

  const react = sveltify({ Counter, Alert }, createPortal, ReactDOM);

  let count = $state(1);
</script>

<h1>{count}</h1>

<react.Counter
  initial={count}
  onCount={(val) => {
    count = val;
  }}
/>

<react.Alert type="primary">
  The count is {count}
</react.Alert>
