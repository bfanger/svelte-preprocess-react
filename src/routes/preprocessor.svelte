<script lang="ts">
  import Counter from "../demo/react-components/Counter";

  if (!Counter) {
    // 'Counter' is declared but its value is never read. (ts)
  }
</script>

<react:Counter initial={10} on:count={console.info} /><br />

<react:Counter initial={25} on:count={console.info} />
