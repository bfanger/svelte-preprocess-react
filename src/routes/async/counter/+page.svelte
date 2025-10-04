<script lang="ts">
  import Counter from "../../../demo/react-components/Counter";
  import sveltifyAsync from "../sveltifyAsync";

  const ReactCounter = sveltifyAsync(Counter);
</script>

<ReactCounter initial={1} />
