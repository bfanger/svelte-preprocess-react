<script lang="ts">
  import { used } from "svelte-preprocess-react";
  import Clicker from "./Clicker";

  used(Clicker);

  let { value = 0, onCount } = $props<{
    value: number;
    onCount: (count: number) => void;
  }>();
</script>

<react:Clicker count={value} {onCount}></react:Clicker>
