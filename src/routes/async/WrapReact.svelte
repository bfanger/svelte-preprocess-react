<script lang="ts">
  import { createElement, useLayoutEffect, useRef, type FC } from "react";
  import { getAllContexts } from "svelte";
  import { renderToReadableStream } from "react-dom/server";
  import { render } from "svelte/server";
  import { browser } from "$app/environment";
  import { createRoot, type Root } from "react-dom/client";
  import Snippet from "./Snippet.svelte";

  const { react$component, react$children, children, ...props } = $props();
  const context = getAllContexts();

  async function ServerChild() {
    const { body } = await render(Snippet, {
      props: { snippet: children },
      context,
    });
    return createElement("react-ssr-child", {
      dangerouslySetInnerHTML: { __html: body },
    });
  }

  async function ssr() {
    const stream = await renderToReadableStream(
      createElement(
        react$component,
        props,
        children ? createElement(ServerChild) : react$children,
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
  let Child = $state<FC>();
  let reactRoot = $state<Root>();

  $effect(() => {
    reactRoot?.render(
      createElement(
        react$component,
        props,
        Child ? createElement(Child) : react$children,
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
            if (!ref.current) {
              throw new Error("No ref");
            }
            ref.current.appendChild(el);
          }, []);
          return createElement("react-children", { ref });
        };
      }}
    >
      {@render children()}
    </svelte-children>
  {/if}
  <react-wrapper
    {@attach (el: HTMLElement) => {
      const root = createRoot(el);
      reactRoot = root;
      return () => root.unmount();
    }}
  ></react-wrapper>
{/if}
