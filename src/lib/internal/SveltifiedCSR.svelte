<script lang="ts">
  /**
   * Render a React component as a Svelte component.
   */
  import {
    createElement,
    useLayoutEffect,
    useRef,
    type FC,
    type ReactNode,
  } from "react";
  import { onDestroy } from "svelte";
  import { createRoot } from "react-dom/client";
  import { createPortal, flushSync } from "react-dom";
  import {
    getSvelteContext,
    setSvelteContext,
    type ReactApp,
  } from "./SvelteContext.js";
  import { SvelteMap } from "svelte/reactivity";

  const { react$component, react$children, children, ...props } = $props();

  let target = $state<HTMLElement>();
  let Child = $state<FC>();
  const ctx = getSvelteContext();

  let autoKey = 0;

  const app = ctx ? ctx.createApp() : createRootApp();
  const nestedApps = new SvelteMap<number, ReactNode>();

  setSvelteContext(() => {
    const key = autoKey++;
    const nestedApp: ReactApp = {
      render(vdom) {
        nestedApps.set(key, vdom);
      },
      unmount() {
        nestedApps.delete(key);
      },
    };
    return nestedApp;
  });

  function createRootApp(): ReactApp {
    const rootEl = document.createElement("sveltify-csr-react-root");
    const reactRoot = createRoot(rootEl);
    document.body.appendChild(rootEl);

    return {
      render(vdom: ReactNode) {
        reactRoot.render(vdom);
      },
      unmount() {
        flushSync(() => {
          reactRoot.unmount();
        });
        document.body.removeChild(rootEl);
      },
    };
  }

  onDestroy(() => {
    app.unmount();
  });

  $effect(() => {
    if (!target) {
      return;
    }
    app.render(
      createPortal(
        createElement(
          react$component,
          props,
          Child ? createElement(Child) : react$children,
        ),
        target,
      ),
    );
  });
</script>

{#if children}
  <sveltify-csr-children
    hidden
    {@attach (el: HTMLElement) => {
      function SveltifiedCSRChild() {
        el.hidden = false;
        const ref = useRef<HTMLElement>(null);
        useLayoutEffect(() => {
          ref.current!.appendChild(el);
        }, []);
        const vdom = [
          createElement("sveltify-csr-react-child", { key: "child", ref }),
        ];
        for (const [key, nestedApp] of nestedApps.entries()) {
          vdom.push(
            createElement("sveltify-csr-nested-app", { key }, nestedApp),
          );
        }
        return vdom;
      }
      Child = SveltifiedCSRChild;
    }}
  >
    {@render children()}
  </sveltify-csr-children>
{/if}
<sveltify-react-portal bind:this={target}></sveltify-react-portal>
