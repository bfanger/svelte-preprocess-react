<script lang="ts">
  import sveltifyReact from "$lib/sveltifyReact";

  import { createElement } from "react";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";

  function HelloWord() {
    return createElement("div", {}, "Hello world");
  }
  const Component = sveltifyReact(
    HelloWord,
    createElement,
    createPortal,
    ReactDOM
  );
</script>

<Component />
