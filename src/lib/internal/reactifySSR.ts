import * as React from "react";
import ReactContext from "./ReactContext.js";
import { createRawSnippet, type Component, type Snippet } from "svelte";
import renderToStringAsync from "./renderToStringAsync.js";
import { render } from "svelte/server";
import ReactifiedSSR from "./ReactifiedSSR.svelte";

/**
 * Convert a Svelte SSR component into a React SSR component.
 */
export default async function reactifySSR(
  SvelteComponent: Component,
  props: Record<string, unknown>,
  reactChildren: unknown,
  ctx: React.ContextType<typeof ReactContext>,
) {
  let children: Snippet | undefined = undefined;
  if (ctx && reactChildren === ctx?.reactChildren) {
    children = ctx.svelteChildren;
  } else if (typeof reactChildren !== "undefined" && reactChildren !== null) {
    // @TODO: Use a nested context
    const nested = await renderToStringAsync(
      React.createElement(
        "reactified-ssr-fragment",
        null,
        reactChildren as React.ReactNode,
      ),
    );
    children = createRawSnippet(() => ({
      render: () => {
        return nested.substring(25, nested.length - 26);
      },
    }));
  }

  const { body, head } = await render(ReactifiedSSR, {
    props: { SvelteComponent, props, reactChildren, children },
  });
  // @TODO: Improve handling of head content
  return React.createElement("reactified", {
    style: { display: "contents" },
    dangerouslySetInnerHTML: { __html: head + body },
  });
}
