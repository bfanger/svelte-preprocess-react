<script lang="ts">
  import { createElement } from "react";
  import Search from "./Search";

  let query = $state("123");
  const react = sveltify({ Search });
</script>

<input type="search" bind:value={query} />

<react.Search
  {query}
  children={(results) =>
    results.map((result, i) => createElement("div", { key: i }, result))}
/>
