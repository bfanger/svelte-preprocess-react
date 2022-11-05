# ReactRouter

Using multiple client side routers in an application is not recommended.
Try to use the router of the framework you're migrating to.

svelte-preprocess-react provides limited compatibility ReactRouter.

This allows you to reuse your React components that use react-router-dom in with minimal changes.

replace:
`import { Link } from "react-router-dom"`
with:
`import { Link } from "svelte-preprocess-react/react-router"`

To use hooks or the NavLink component, you need to wrap your component in a Router component.

[svelte-preprocess-react/react-router/Router.svelte](../src/lib/react-router/Router.svelte)

## Usage in @sveltejs/kit

In src/routes/+layout.svelte

```svelte
<script lang="ts">
  import Router from "svelte-preprocess-react/react-router/Router.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
</script>

<Router
  location={$page.url}
  params={$page.params}
  push={(url) => goto(url)}
  replace={(url) => goto(url, { replaceState: true })}
>
  <slot />
</Router>
```
