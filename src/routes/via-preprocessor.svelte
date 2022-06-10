<script lang="ts">
  import Counter from "../demo/react-components/Counter";
</script>

<react:Counter initial={10} on:count={console.info} />
