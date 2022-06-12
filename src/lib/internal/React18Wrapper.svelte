<script lang="ts">
  import { afterUpdate } from "svelte";
  import React, { createElement } from "react";
  import { createRoot, type Root } from "react-dom/client";
  import { renderToString } from "react-dom/server";

  export let ReactComponent: React.FunctionComponent | React.ComponentClass;

  const html = ReactComponent
    ? renderToString(createElement(ReactComponent, $$props))
    : "";

  let root: Root | undefined;

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
    root.render(createElement(ReactComponent, props));
  });
</script>

<react-wrapper use:reactRoot>{@html html}</react-wrapper>

<style>
  react-wrapper {
    display: contents;
  }
</style>
