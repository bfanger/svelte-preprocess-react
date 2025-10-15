<script lang="ts">
  /**
   * Render a React component as a Svelte component.
   */
  import { createElement, use, type Attributes } from "react";
  import { getAllContexts, getContext, setContext, type Snippet } from "svelte";
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

  const parent = getContext<SveltifiedSSRContext | undefined>("SveltifiedSSR");
  const context = getAllContexts();

  type SveltifiedSSRContext =
    | {
        prefix: string;
        siblingIndex: number;
        defer: (vdom: ReturnType<typeof createElement>) => void;
        replace: (id: string) => void;
      }
    | undefined;

  const nestedChildren: ReturnType<typeof createElement>[] = [];
  const replacements: string[] = [];

  let childIndex = 0;
  const current = setContext<SveltifiedSSRContext>("SveltifiedSSR", {
    prefix: parent ? `${parent.prefix + parent.siblingIndex}-` : "-",
    siblingIndex: parent ? parent.siblingIndex++ : 0,
    defer: (vdom) => {
      const key = current.prefix + childIndex;
      current.replace(key);
      childIndex = nestedChildren.push(
        createElement(`sveltified-ssr-source${key}`, { key }, vdom),
      );
    },
    replace(id: string) {
      if (parent) {
        parent.replace(id);
      }
      replacements.push(id);
    },
  })!;

  const reactChildren = children ? createElement(Child) : react$children;

  const vdom = createElement(
    ReactContext,
    {
      value: { context, reactChildren, svelteChildren: children },
    },
    createElement(react$component, props, reactChildren),
  );

  // svelte-ignore non_reactive_update
  let html = await reactToHtml();

  for (const id of replacements) {
    const sourceTag = `sveltified-ssr-source${id}`;
    const sourceStart = html.indexOf(`<${sourceTag}>`);
    const sourceEnd = html.indexOf(`</${sourceTag}>`);
    let content = "";
    if (sourceStart !== -1 && sourceEnd !== -1) {
      content = html.slice(sourceStart + sourceTag.length + 2, sourceEnd);
      html =
        html.slice(0, sourceStart) +
        html.slice(sourceEnd + sourceTag.length + 3);
    }
    const targetTag = `sveltified-ssr-target${id}`;
    html = html.replaceAll(`<${targetTag}></${targetTag}>`, content);
  }

  async function reactToHtml() {
    if (parent) {
      parent.defer(vdom);
      const tag = `sveltified-ssr-target${parent.prefix + childIndex}`;
      return `<${tag}></${tag}>`;
    }
    return await streamToString(await renderToReadableStream(vdom));
  }

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
    if (children && !parent) {
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
      return [
        createElement("sveltify-ssr-child", {
          key: "svelte-child",
          dangerouslySetInnerHTML: { __html: body },
        }),
        ...nestedChildren,
      ];
    }
    return undefined;
  }
</script>

{@html html}
