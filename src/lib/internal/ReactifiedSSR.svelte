<script lang="ts">
  import { type Component, type Snippet } from "svelte";

  /**
   * Render a Svelte component as a Svelte component, but with props & children from React.
   */
  type Props = {
    SvelteComponent: Component;
    props: Record<string, unknown>;
    reactChildren?: unknown;
    children?: Snippet;
  };
  const { SvelteComponent, reactChildren, props, children }: Props = $props();
</script>

{#if reactChildren !== undefined}
  <SvelteComponent {...props}>
    {#if children}
      {@render children()}
    {/if}
  </SvelteComponent>
{:else}
  <SvelteComponent {...props} />
{/if}
