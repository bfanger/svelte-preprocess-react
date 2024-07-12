<script>
  import { used } from "svelte-preprocess-react";
  import Clicker from "./Clicker";

  used(Clicker);

  export let value = 0;
</script>

<react:Clicker count={value} on:count />
