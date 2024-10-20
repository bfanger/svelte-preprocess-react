<script lang="ts">
  import { RouterProvider } from "svelte-preprocess-react/react-router";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Menu from "./Menu";

  const react = sveltify({
    RouterProvider,
    Menu,
  });
</script>

<react.RouterProvider value={{ url: $page.url, params: $page.params, goto }}>
  <react.Menu />
  <slot />
</react.RouterProvider>
