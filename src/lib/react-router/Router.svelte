<script lang="ts">
  import used from "../used.js";
  import RouterContext from "./internal/RouterContext.js";
  import type { Location } from "./types";

  const RouterContextProvider = RouterContext.Provider;
  used(RouterContextProvider);

  export let location: Location | URL;
  export let params: Record<string, string> = {};
  export let push: (url: string) => void;
  export let replace: (url: string) => void;
</script>

<react:RouterContextProvider
  value={{
    base:
      typeof window === "undefined"
        ? "http://localhost/"
        : window.location.href,
    location,
    params,
    history: {
      push,
      replace,
    },
  }}
>
  <slot />
</react:RouterContextProvider>
