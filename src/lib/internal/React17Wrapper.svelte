<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import React, { createElement } from "react";
  import * as ReactDOM from "react-dom";
  import { renderToString } from "react-dom/server";

  export let ReactComponent: React.FC;

  const html = ReactComponent
    ? renderToString(createElement(ReactComponent, $$props))
    : "";

  let el: Element;

  onMount(() => {
    return () => {
      ReactDOM.unmountComponentAtNode(el);
    };
  });
  afterUpdate(() => {
    if (!el) {
      return;
    }
    ReactDOM.render(createElement(ReactComponent, $$props), el);
  });
</script>

<react-wrapper bind:this={el}>{@html html}</react-wrapper>

<style>
  react-wrapper {
    display: contents;
  }
</style>
