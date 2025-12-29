<script lang="ts">
  import { sveltify } from "svelte-preprocess-react";
  import Accordion from "./Accordion";

  const react = sveltify({ Accordion });

  let isOpened = $state(false);
</script>

<button
  onclick={() => {
    isOpened = !isOpened;
  }}
>
  Toggle: {isOpened}
</button>

<react.Accordion
  {isOpened}
  onOpen={() => {
    isOpened = true;
  }}
  onClose={() => {
    isOpened = false;
  }}
>
  Content
</react.Accordion>

<style>
  button {
    margin-bottom: 1rem;
  }
</style>
