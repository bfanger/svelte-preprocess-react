<script lang="ts">
  import sveltify from "$lib/sveltify";

  import { createElement } from "react";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";

  function HelloWord() {
    return createElement("div", null, "Hello world");
  }
  const Component = sveltify(HelloWord, createElement, createPortal, ReactDOM);
</script>

<Component />
