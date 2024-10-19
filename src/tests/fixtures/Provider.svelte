<script lang="ts">
  import type { Context as ContentType } from "react";

  export let Context: ContentType<any>;
  $: Provider = Context.Provider;

  const react = sveltify({ Provider });
</script>

<react.Provider>content</react.Provider>

<react.Provider>
  <button>ok</button>
</react.Provider>
