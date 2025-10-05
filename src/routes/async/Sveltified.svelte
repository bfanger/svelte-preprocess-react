<script lang="ts">
  /**
   * Render a React component as a Svelte component.
   */
  import { createElement, useLayoutEffect, useRef, type FC } from "react";
  import { getAllContexts, onMount } from "svelte";
  import { renderToReadableStream } from "react-dom/server";
  import { render } from "svelte/server";
  import { browser } from "$app/environment";
  import { createRoot, type Root } from "react-dom/client";
  import Snippet from "./Snippet.svelte";
  import { createPortal } from "react-dom";

  const { react$component, react$children, children, ...props } = $props();
  const context = getAllContexts();

  async function ssr() {
    const stream = await renderToReadableStream(
      createElement(
        react$component,
        props,
        children
          ? createElement(async function ReactServerComponent() {
              const { body } = await render(Snippet, {
                props: { snippet: children },
                context,
              });
              return createElement("sveltify-svelte-render", {
                dangerouslySetInnerHTML: { __html: body },
              });
            })
          : react$children,
      ),
    );
    let html = "";
    await stream.pipeTo(
      new WritableStream({
        write(chunk) {
          html += new TextDecoder().decode(chunk);
        },
      }),
    );
    return await Promise.resolve(html);
  }

  let reactRoot = $state<Root>();
  let target = $state<HTMLElement>();
  let Child = $state<FC>();

  onMount(() => {
    reactRoot = createRoot(document.createElement("div"));
    return () => reactRoot?.unmount();
  });

  $effect(() => {
    if (!target || !reactRoot) {
      return;
    }
    reactRoot.render(
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

{#if !browser}
  {@html await ssr()}
{:else}
  {#if children}
    <svelte-children
      {@attach (el: HTMLElement) => {
        Child = () => {
          const ref = useRef<HTMLElement>(null);
          useLayoutEffect(() => {
            ref.current!.appendChild(el);
          }, []);
          return createElement("sveltify-react-child", { ref });
        };
      }}
    >
      {@render children()}
    </svelte-children>
  {/if}
  <sveltify-react-portal bind:this={target}></sveltify-react-portal>
{/if}
