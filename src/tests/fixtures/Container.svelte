<script lang="ts">
  import Clicker from "./Clicker";

  const react = sveltify({ Clicker });

  let count = 1;
</script>

<react.Clicker
  {count}
  onCount={(next) => {
    count = next;
  }}
></react.Clicker>
