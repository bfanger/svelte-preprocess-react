<script lang="ts">
  import type { Context as ContentType } from "react";
  import { used } from "svelte-preprocess-react";

  export let Context: ContentType<any>;

  used(Context);
</script>

<react:Context.Provider>content</react:Context.Provider>

<react:Context.Provider>
  <button>ok</button>
</react:Context.Provider>
