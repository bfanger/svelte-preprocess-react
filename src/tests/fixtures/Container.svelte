<script>
  // @ts-nocheck
  import Clicker from "./Clicker";

  let count = 1;
</script>

<react:Clicker
  {count}
  on:count={(next) => {
    count = next;
  }}
/>
