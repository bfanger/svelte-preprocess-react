<script lang="ts">
  import { used } from "svelte-preprocess-react";
  import Clicker from "./Clicker";

  used(Clicker);

  let count = 1;
</script>

<h2>prop and event</h2>
<react:Clicker
  {count}
  onCount={(next) => {
    count = next;
  }}
></react:Clicker>
<h2>prop and Prop event</h2>
<react:Clicker
  count={10}
  onCount={() => {
    console.info("count");
  }}
></react:Clicker>
<h2>prop</h2>
<react:Clicker {count}></react:Clicker>
<h2>.</h2>
<react:Clicker></react:Clicker>
