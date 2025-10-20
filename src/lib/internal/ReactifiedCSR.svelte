<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import ExtractContexts from "svelte-preprocess-react/internal/ExtractContexts.svelte";

  export type ReactifiedSync = (
    props: Record<string, any>,
    children: any,
    slot: HTMLElement | null,
  ) => void;

  /**
   * Render a Svelte component as a Svelte component, but with props & children from React.
   */
  type Props = {
    SvelteComponent: Component;
    init: (sync: ReactifiedSync) => void;
    setContexts: (context: Map<any, any>) => void;
    props: Record<string, any>;
    react$children?: any;
    slot?: HTMLElement | null;
    children?: Snippet;
  };
  let {
    SvelteComponent,
    init,
    setContexts,
    react$children,
    slot,
    props,
    children,
  }: Props = $props();

  init((newProps, newChildren, newSlot) => {
    props = newProps;
    react$children = newChildren;
    slot = newSlot;
  });
</script>

{#if react$children !== undefined}
  <SvelteComponent {...props}>
    <ExtractContexts {setContexts} />
    {#if children}
      {@render children()}
    {:else if slot}
      <target-for-react-portal-children
        {@attach (el: HTMLElement) => {
          const child = slot;
          if (child) {
            const parent = child.parentElement;
            el.appendChild(child);
            return () => {
              parent?.appendChild(child);
            };
          }
        }}
      ></target-for-react-portal-children>
    {/if}
  </SvelteComponent>
{:else}
  <SvelteComponent {...props} />
{/if}
