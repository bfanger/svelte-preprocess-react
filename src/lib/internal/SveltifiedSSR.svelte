<script lang="ts">
  /**
   * Render a React component as a Svelte component.
   */
  import { createElement, use, type Attributes } from "react";
  import { getAllContexts, type Snippet } from "svelte";
  import { renderToReadableStream } from "react-dom/server";
  import ReactContext from "./ReactContext.js";
  import { render } from "svelte/server";
  import SnippetComponent from "./SnippetComponent.svelte";

  type Props = {
    react$component: Parameters<typeof createElement>[0];
    react$children?: any;
    children?: Snippet;
  } & Attributes;
  const { react$component, react$children, children, ...props }: Props =
    $props();

  const context = getAllContexts();

  const reactChildren = children ? createElement(Child) : react$children;

  const vdom = createElement(
    ReactContext,
    { value: { context, reactChildren, svelteChildren: children } },
    createElement(react$component, props, reactChildren),
  );

  const html = await streamToString(await renderToReadableStream(vdom));

  async function streamToString(stream: ReadableStream) {
    let output = "";
    const decoder = new TextDecoder();
    await stream.pipeTo(
      new WritableStream({
        write(chunk) {
          output += decoder.decode(chunk);
        },
      }),
    );
    return output;
  }

  async function Child() {
    const ctx = use(ReactContext);
    if ("react$children" in props) {
      console.warn(
        "svelte-preprocess-react: Can't pass react & svelte children at the same time",
      );
    }
    if (children) {
      const { body, head } = await render(SnippetComponent, {
        props: { snippet: children },
        context: ctx!.context,
      });
      if (head !== "") {
        console.warn(
          "svelte-preprocess-react: Changing the head not supported in Svelte components nested inside React components",
          head,
        );
      }
      return createElement("sveltify-ssr-child", {
        dangerouslySetInnerHTML: { __html: body },
      });
    }
    return undefined;
  }
</script>

{@html html}
