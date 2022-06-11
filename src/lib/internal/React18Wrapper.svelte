<script lang="ts">
  import { onMount } from "svelte";
  import React, { createElement } from "react";
  import { createRoot, type Root } from "react-dom/client";
  import { renderToString } from "react-dom/server";

  export let ReactComponent: React.FC;

  const html = ReactComponent
    ? renderToString(createElement(ReactComponent, $$props))
    : "";

  let el: Element;
  let root: Root | undefined;

  $: if (root && $$props) {
    rerender();
  }

  onMount(() => {
    root = createRoot(el);
    rerender();
    return () => {
      root?.unmount();
    };
  });
  function rerender() {
    if (!root) {
      return;
    }
    root.render(createElement(ReactComponent, $$props));
  }
</script>

<react-wrapper bind:this={el}>{@html html}</react-wrapper>

<style>
  react-wrapper {
    display: contents;
  }
</style>
