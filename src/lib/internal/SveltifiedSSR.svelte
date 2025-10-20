<script lang="ts">
  /**
   * Render a React component as a Svelte component.
   */
  import { createElement, use, type Attributes, type FC } from "react";
  import { render } from "svelte/server";
  import { getAllContexts, getContext, setContext, type Snippet } from "svelte";
  import SnippetComponent from "./SnippetComponent.svelte";
  import ReactContext from "./ReactContext.js";
  import renderToStringAsync from "./renderToStringAsync.js";

  type Props = {
    react$component: Parameters<typeof createElement>[0];
    react$children?: any;
    children?: Snippet;
  } & Attributes;
  const { react$component, react$children, children, ...props }: Props =
    $props();

  type SveltifiedSSRContext = {
    nested: FC[];
    suffix: string;
    autoIndex: number;
    replace: (suffix: string) => void;
  };
  const parent = getContext<SveltifiedSSRContext | undefined>("SveltifiedSSR");
  const context = getAllContexts();
  const key = parent ? parent.autoIndex++ : 0;
  const suffix = parent ? `${parent.suffix}-${key}` : ``;

  const replacements: string[] = [];
  const current = setContext<SveltifiedSSRContext>("SveltifiedSSR", {
    nested: [],
    suffix,
    autoIndex: 0,
    replace: (id) => (parent ? parent.replace(id) : replacements.unshift(id)),
  });

  let svelteRenderPromise: PromiseLike<string> | undefined;

  async function RenderSnippet() {
    if (!children) {
      throw new Error("Requires children snippet");
    }
    const ctx = use(ReactContext)!;
    const promise = render(SnippetComponent, {
      props: { snippet: children },
      context: ctx.context,
    }).then((result) => {
      if (result.head !== "") {
        console.warn("svelte-preprocess-react doesn't support head content ");
      }
      return result.body;
    });

    svelteRenderPromise = promise;

    return createElement(`sveltified-ssr-snippet${ctx.suffix}`, {
      dangerouslySetInnerHTML: {
        __html: await promise,
      },
    });
  }

  async function RenderNested() {
    await svelteRenderPromise;
    return current.nested.map((Component, index) =>
      createElement(Component, { key: index }),
    );
  }

  async function renderHTML() {
    let vdom: any;
    const selfClosing = ["img", "input", "br", "hr", "meta", "link"].includes(
      typeof react$component === "string" ? react$component : "",
    );
    if (!parent) {
      if (selfClosing) {
        vdom = createElement(react$component, props);
      } else {
        vdom = createElement(
          ReactContext,
          { value: { suffix, context } },
          createElement(react$component, props, [
            children
              ? [createElement(RenderSnippet, { key: "snippet", suffix })]
              : react$children,
            createElement(RenderNested, { key: "nested", suffix }),
          ]),
        );
      }
    } else {
      parent.nested.push(() =>
        createElement(
          `sveltified-ssr-nested${suffix}`,
          null,
          createElement(
            ReactContext,
            { key, value: { suffix, context } },
            selfClosing
              ? createElement(react$component, props)
              : !children
                ? createElement(react$component, props, react$children)
                : createElement(react$component, props, [
                    createElement(RenderSnippet, { key: "snippet", suffix }),
                    createElement(RenderNested, { key: "nested", suffix }),
                  ]),
          ),
        ),
      );
      current.replace(suffix);

      return `<sveltified-ssr-placeholder${suffix}></sveltified-ssr-placeholder${suffix}>`;
    }
    let html = await renderToStringAsync(vdom);
    for (const replacement of replacements) {
      const sourceTag = `sveltified-ssr-nested${replacement}`;
      const targetTag = `sveltified-ssr-placeholder${replacement}`;
      const sourceStart = html.indexOf(`<${sourceTag}>`);
      const sourceEnd = html.indexOf(`</${sourceTag}>`);
      let content = "";
      if (sourceStart !== -1 && sourceEnd !== -1) {
        content = html.slice(sourceStart + sourceTag.length + 2, sourceEnd);
        html =
          html.slice(0, sourceStart) +
          html.slice(sourceEnd + sourceTag.length + 3);
      }
      html = html.replaceAll(`<${targetTag}></${targetTag}>`, content);
    }
    return html;
  }

  const html = await renderHTML();
</script>

{@html html}
