<script lang="ts">
  import Alert from "../../demo/react-components/Alert";
  import Counter from "../../demo/react-components/Counter";
  import { sveltify } from "svelte-preprocess-react";

  let group = $state("alert");

  let Component = $derived(sveltify(group === "alert" ? Alert : Counter));
</script>

<div style:margin-bottom="1rem">
  <label><input type="radio" bind:group value="alert" /> Alert</label>
  <label><input type="radio" bind:group value="counter" /> Counter</label>
</div>

<Component />
