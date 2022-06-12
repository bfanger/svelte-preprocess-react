<script lang="ts" context="module">
  /**
   * This page exposes variables on the window object that can be used by the Playwright tests.
   */

  import type { Load } from "@sveltejs/kit";

  export const load: Load = async ({ fetch }) => {
    const reactVersion = await (await fetch("/api/react-version.json")).json();
    const sveltifyReactModule =
      reactVersion <= 17
        ? () => import("$lib/sveltifyReact17")
        : () => import("$lib/sveltifyReact18");
    return {
      props: {
        reactVersion,
        sveltifyReact: (await sveltifyReactModule()).default,
      },
    };
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import ClickerReact from "../tests/fixtures/Clicker";

  export let reactVersion: number;
  export let sveltifyReact: any;

  let loading = true;
  onMount(() => {
    const win: any = window;
    win.sveltifyReact = sveltifyReact;
    win.ClickerReact = ClickerReact;
    win.Clicker = sveltifyReact(ClickerReact);

    loading = false;
  });
</script>

<div class="ui">
  <p>Using React {reactVersion}</p>
  {#if loading}
    <h1 class="loading">Loading...</h1>
  {:else}
    <h1>Ready</h1>
  {/if}
</div>

<div id="playground" />

<style lang="scss">
  .ui {
    text-align: center;
    margin: 10px;
  }
  p {
    font: 14px sans-serif;
    color: #585866;
    margin: 0;
  }

  h1 {
    font: 20px sans-serif;
    margin: 0;
    color: #416c28;
    letter-spacing: 0.1em;
    &.loading {
      color: #686b94;
    }
  }
</style>
