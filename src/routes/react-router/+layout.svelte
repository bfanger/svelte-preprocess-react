<script lang="ts">
  import Menu from "./Menu";
  import { RouterProvider } from "$lib/react-router";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { used } from "$lib";

  used(RouterProvider, Menu);
</script>

<react:RouterProvider value={{ url: $page.url, params: $page.params, goto }}>
  <react:Menu />
  <slot />
</react:RouterProvider>
