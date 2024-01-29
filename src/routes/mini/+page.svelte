<script lang="ts">
  import { createElement } from "react";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { renderToString } from "react-dom/server";
  import { sveltify } from "svelte-preprocess-react";

  function HelloWord() {
    return createElement("h1", null, "Hello world");
  }
  const Component = sveltify(HelloWord, createPortal, ReactDOM, renderToString);
</script>

<Component />
