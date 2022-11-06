# react-router

Using multiple routers in one app is a problem, as they are not built with that use-case in mind.
To make migrate React components that using react-router to Svelte easier, we created `svelte-preprocess-react/react-router`

This is **not** a drop-in replacement for react-router, as it lacks many features, but it eases the migration process.

## What does it do?

It offers Hooks and Components that are used in the leaf nodes of the component tree, like:

- `<Link />`
- `<NavLink />`
- useLocation()
- useHistory()
- useParams()

This allows the basic things like reading info about the current url, rendering links and programmatic navigation to work.

## What it does NOT do?

Complex things like route matching, rendering routes, data-loading are out of scope.
This becomes the job of the (svelte) router you're migrating to.

## How to use it?

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

As you can see the `<Router>` is exposing the push & replace actions but the actual navigation and url updates are done by the SvelteKit router.
