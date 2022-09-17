<script lang="ts">
  import used from "$lib/used";
  import type { Context as ContentType } from "react";

  export let Context: ContentType<any>;

  used(Context);
</script>

<react:Context.Provider>content</react:Context.Provider>

<react:Context.Provider>
  <button>ok</button>
</react:Context.Provider>
