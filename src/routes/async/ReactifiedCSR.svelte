<script lang="ts">
  import { type Component, type Snippet } from "svelte";

  /**
   * Render a Svelte component as a Svelte component, but with props & children from React.
   */
  type Props = {
    SvelteComponent: Component;
    props: Record<string, any>;
    react$children?: any;
    slot?: HTMLElement | null;
    children?: Snippet;
  };
  const { SvelteComponent, react$children, slot, props, children }: Props =
    $props();
</script>

{#if react$children !== undefined}
  <SvelteComponent {...props}>
    {#if children}
      {@render children()}
    {:else if slot}
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
