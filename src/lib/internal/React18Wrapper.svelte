<script lang="ts">
  import { afterUpdate } from "svelte";
  import React, { createElement } from "react";
  import { createRoot, type Root } from "react-dom/client";
  import { renderToString } from "react-dom/server";
  import SvelteSlot from "./SvelteSlot";

  export let ReactComponent: React.FunctionComponent | React.ComponentClass;

  const html = ReactComponent
    ? renderToString(createElement(ReactComponent, $$props))
    : "";

  let root: Root | undefined;
  let slot: HTMLElement | undefined;

  function reactRoot(el: Element) {
    const app = createRoot(el);
    root = app;
    return {
      destroy() {
        app.unmount();
      },
    };
  }

  afterUpdate(() => {
    if (!root) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { ReactComponent: _, ...props } = $$props;
    if ($$slots.default) {
      props.children = React.createElement(SvelteSlot, { slot });
    }
    root.render(createElement(ReactComponent, props));
  });
</script>

<react-wrapper use:reactRoot>{@html html}</react-wrapper>
{#if $$slots.default}
  <react-children bind:this={slot}><slot /></react-children>
{/if}

<style>
  react-wrapper {
    display: contents;
  }
  react-children {
    display: none;
  }
</style>
