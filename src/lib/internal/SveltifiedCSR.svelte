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
  import { createPortal } from "react-dom";
  import { getSvelteContext, setSvelteContext } from "./SvelteContext.js";
  import { SvelteMap } from "svelte/reactivity";
  import ReactContext from "./ReactContext.js";
  import type { Root } from "react-dom/client";

  const { react$component, react$children, react$props, children, ...props } =
    $props();

  let target = $state<HTMLElement>();
  let Child = $state<FC>();
  const createBranch = getSvelteContext();
  const context = getAllContexts();

  let autoKey = 0;

  const root = createBranch();
  const branches = new SvelteMap<number, ReactNode>();

  setSvelteContext(() => {
    const key = autoKey++;
    const branch: Root = {
      render(vdom) {
        branches.set(key, vdom);
      },
      unmount() {
        branches.delete(key);
      },
    };
    return branch;
  });

  onDestroy(() => {
    root.unmount();
  });

  $effect(() => {
    if (!target) {
      return;
    }
    root.render(
      createPortal(
        createElement(
          ReactContext,
          { value: { context, suffix: "sveltify-csr" } },
          createElement(
            react$component,
            react$props ?? props,
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
        for (const [key, nestedApp] of branches.entries()) {
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
<sveltify-csr-portal bind:this={target}></sveltify-csr-portal>
