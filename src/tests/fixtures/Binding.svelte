<script lang="ts">
  import Clicker from "./Clicker";

  const react = sveltify({ Clicker });

  let count = 1;
</script>

<react.Clicker bind:count />
