<script lang="ts">
  import type { Context as ContentType } from "react";
  import { used } from "svelte-preprocess-react";

  export let Context: ContentType<any>;
  $: Provider = Context.Provider;

  used(Provider);
</script>

<react:Provider>content</react:Provider>

<react:Provider>
  <button>ok</button>
</react:Provider>
