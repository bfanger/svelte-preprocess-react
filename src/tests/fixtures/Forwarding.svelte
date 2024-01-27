<script lang="ts">
  import Clicker from "./Clicker";
  import { used } from "svelte-preprocess-react";

  used(Clicker);

  let { value = 0, onCount } = $props<{
    value: number;
    onCount: (count: number) => void;
  }>();
</script>

<react:Clicker count={value} {onCount} />
