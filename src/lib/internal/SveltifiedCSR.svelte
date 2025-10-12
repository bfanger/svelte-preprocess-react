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
  import { getAllContexts, onDestroy } from "svelte";
  import { createRoot } from "react-dom/client";
  import { createPortal, flushSync } from "react-dom";
  import {
    getSvelteContext,
    setSvelteContext,
    type ReactApp,
  } from "./SvelteContext.js";
  import { SvelteMap } from "svelte/reactivity";
  import ReactContext from "svelte-preprocess-react/internal/ReactContext.js";

  const { react$component, react$children, children, ...props } = $props();

  let target = $state<HTMLElement>();
  let Child = $state<FC>();
  const ctx = getSvelteContext();
  const context = getAllContexts();

  let autoKey = 0;

  const app = ctx.createApp(createRoot, flushSync);
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
          ReactContext,
          { value: { context } },
          createElement(
            react$component,
            props,
            Child ? createElement(Child) : react$children,
          ),
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
