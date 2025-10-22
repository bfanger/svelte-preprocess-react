<script lang="ts">
  import { createElement } from "react";
  import { sveltify } from "svelte-preprocess-react";

  function HelloWord() {
    return createElement("h1", null, "Hello world");
  }
  const react = sveltify({ HelloWord });
</script>

<react.HelloWord />
