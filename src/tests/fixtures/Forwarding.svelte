<script lang="ts">
  import Clicker from "./Clicker";

  const react = sveltify({ Clicker });

  let { value = 0, onCount } = $props<{
    value: number;
    onCount: (count: number) => void;
  }>();
</script>

<react.Clicker count={value} {onCount}></react.Clicker>
