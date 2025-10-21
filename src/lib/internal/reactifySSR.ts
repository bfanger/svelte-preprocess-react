import { createElement, type ContextType } from "react";
import ReactContext from "./ReactContext.js";
import { createRawSnippet, type Component, type Snippet } from "svelte";
import renderToStringAsync from "./renderToStringAsync.js";
import { render } from "svelte/server";
import ReactifiedSSR from "./ReactifiedSSR.svelte";

export default async function reactifySSR(
  SvelteComponent: Component,
  props: any,
  reactChildren: any,
  ctx: ContextType<typeof ReactContext>,
) {
  let children: Snippet | undefined = undefined;
  if (ctx && reactChildren === ctx?.reactChildren) {
    children = ctx.svelteChildren;
  } else if (typeof reactChildren !== "undefined") {
    // @TODO: Use a nested context
    const nested = await renderToStringAsync(
      createElement("reactified-ssr-fragment", null, reactChildren),
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
  return createElement("reactified", {
    style: { display: "contents" },
    dangerouslySetInnerHTML: { __html: head + body },
  });
}
