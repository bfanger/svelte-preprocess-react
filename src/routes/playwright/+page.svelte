<script lang="ts">
  import { createPortal } from "react-dom";
  import { onMount } from "svelte";
  import { sveltify } from "svelte-preprocess-react";
  import type { PageData } from "./$types";
  import ClickerReact from "../../tests/fixtures/Clicker";

  export let data: PageData;

  $: reactVersion = data.reactVersion as number;
  $: ReactDOM = data.ReactDOM;

  let loading = true;

  onMount(() => {
    const win: any = window;
    win.sveltify = sveltify;
    win.ReactDOM = ReactDOM;
    win.ClickerReact = ClickerReact;
    win.Clicker = sveltify(ClickerReact, createPortal, ReactDOM);

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

<style>
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
