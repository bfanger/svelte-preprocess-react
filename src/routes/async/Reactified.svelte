<script lang="ts">
  import type { Component } from "svelte";

  /**
   * Render a Svelte component as a Svelte component, but with props & children from React.
   */
  type Props = {
    SvelteComponent: Component;
    props: Record<string, any>;
    react$children?: any;
    slot?: HTMLElement;
  };
  const { SvelteComponent, react$children, slot, props }: Props = $props();
</script>

{#if react$children !== undefined}
  <SvelteComponent {...props}>
    {#if slot}
      <target-for-react-portal-children
        {@attach (el: HTMLElement) => {
          el.appendChild(slot);
        }}
      ></target-for-react-portal-children>
    {/if}
  </SvelteComponent>
{:else}
  <SvelteComponent {...props} />
{/if}
