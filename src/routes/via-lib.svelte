<script lang="ts">
  import sveltifyReact18 from "$lib/sveltifyReact18";

  import Counter from "../demo/react-components/Counter";

  const ReactCounter = sveltifyReact18(Counter);
</script>

<ReactCounter initial={10} onCount={console.info} />
