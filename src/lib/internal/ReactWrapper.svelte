<script lang="ts">
  import type React from "react";
  import { afterUpdate } from "svelte";
  import type { Readable } from "svelte/store";
  import SvelteToReactContext from "./SvelteToReactContext";
  import SvelteSlot from "./SvelteSlot";
  import type { ReactImplementation } from "./types";

  type ReactRoot = ReturnType<NonNullable<ReactImplementation["createRoot"]>>;

  export let reactComponent: React.FunctionComponent | React.ComponentClass;
  export let reactImplementation: ReactImplementation;
  export let svelteInstance: Readable<any>;

  const { createElement, createRoot, renderToString, rerender } =
    reactImplementation;

  let el: Element | undefined;
  let root: ReactRoot | undefined;
  let slot: HTMLElement | undefined;

  function renderHtml() {
    if (typeof window !== "undefined" || !renderToString) {
      return "";
    }
    return renderToString(createElement(reactComponent, reactProps()));
  }

  function reactProps() {
    const props = { ...$$props };
    delete props.reactComponent;
    delete props.reactImplementation;
    delete props.svelteInstance;
    return props;
  }

  function reactRoot(node: Element) {
    if (!createRoot) {
      el = node;
      return undefined;
    }

    const newRoot = createRoot(node);
    root = newRoot;
    return {
      destroy() {
        newRoot.unmount();
        if (el === node) {
          el = undefined;
        }
      },
    };
  }

  afterUpdate(() => {
    if (createRoot && !root) {
      return;
    }
    const vdom = createElement(
      SvelteToReactContext.Provider,
      { value: $svelteInstance },
      $$slots.default
        ? createElement(
            reactComponent,
            reactProps(),
            createElement(SvelteSlot, { slot })
          )
        : createElement(reactComponent, reactProps())
    );
    rerender(vdom, el, root);
  });
</script>

<react-wrapper use:reactRoot>{@html renderHtml()}</react-wrapper>
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
