<script lang="ts">
  import { createContext, type Context } from "react";

  type Props = {
    context: Context<any>;
  };
  let { context = createContext(false) }: Props = $props();

  let react = $derived(sveltify({ Provider: context.Provider }));
</script>

<react.Provider value={true}>content</react.Provider>
