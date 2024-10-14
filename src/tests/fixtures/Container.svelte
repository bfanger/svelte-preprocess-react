<script lang="ts">
  import { used } from "svelte-preprocess-react";
  import Clicker from "./Clicker";

  used(Clicker);

  let count = 1;
</script>

<react:Clicker
  {count}
  onCount={(next) => {
    count = next;
  }}
></react:Clicker>
