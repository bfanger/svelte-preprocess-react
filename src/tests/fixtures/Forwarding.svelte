<script>
  import Clicker from "./Clicker";
  import { used } from "svelte-preprocess-react";

  used(Clicker);

  export let value = 0;
</script>

<react:Clicker count={value} on:count />
