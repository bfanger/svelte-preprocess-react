<script lang="ts">
  import sveltifyReact from "$lib/sveltifyReact17";
  import CounterReact from "../demo/react-components/Counter";

  const Counter = sveltifyReact(CounterReact);
</script>

<Counter initial={10} onCount={console.info} />
