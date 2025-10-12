<script lang="ts">
  import CounterAsync from "../examples/CounterAsync";
  import sveltifyAsync from "../sveltifyAsync";

  const ReactCounter = sveltifyAsync(CounterAsync);
</script>

<ReactCounter initial={1} />
