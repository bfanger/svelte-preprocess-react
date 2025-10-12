<script lang="ts">
  import { mount, onMount, unmount } from "svelte";
  import StatefulClicker from "./StatefulClicker.svelte";

  let loading = $state(true);

  onMount(() => {
    const win: any = window;
    win.svelteMount = mount;
    win.svelteUnmount = unmount;
    win.StatefulClicker = StatefulClicker;
    loading = false;
  });
</script>

<div class="ui">
  {#if loading}
    <h1 class="loading">Loading...</h1>
  {:else}
    <h1>Ready</h1>
  {/if}
</div>

<div id="playground"></div>

<style>
  .ui {
    text-align: center;
    margin: 10px;
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
