<script lang="ts">
  import { used } from "svelte-preprocess-react";
  import { RouterProvider } from "svelte-preprocess-react/react-router";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Menu from "./Menu";

  used(RouterProvider, Menu);
</script>

<react:RouterProvider value={{ url: $page.url, params: $page.params, goto }}>
  <react:Menu />
  <slot />
</react:RouterProvider>
