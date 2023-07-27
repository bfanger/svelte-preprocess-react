<script lang="ts">
  import { createElement } from "react";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { sveltify } from "svelte-preprocess-react";

  function HelloWord() {
    return createElement("div", null, "Hello world");
  }
  const Component = sveltify(HelloWord, createPortal, ReactDOM);
</script>

<Component />
