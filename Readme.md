# Svelte Preprocess React

Seamlessly use React components inside a Svelte app

# "Embrace, extend, and extinguish"

This preprocessor is intended as temporary solution when migrating an existing large React codebase.
The goal should be to rewrite all the components to Svelte and remove this preprocessor from your setup.

## Usage

```html
<script>
  import MyReactComponent from "./MyReactComponent.jsx";
</script>

<react:MyReactComponent />
```

## Setup

```js
// svelte.config.js
import preprocessReact from "svelte-preprocess-react";

export default {
  preprocess: preprocessReact(),
};
```

or when used in combination with svelte-preprocess:

```js
// svelte.config.js
import preprocess from "svelte-preprocess";
import preprocessReact from "svelte-preprocess-react";

export default {
  preprocess: [preprocess({ sourceMap: true }), preprocessReact()],
};
```

## Ideas / Roadmap

- Auto insert `<react:` for .tsx and .jsx imports.
- Research if it's possible to reliably determine if a Component is a React component at compile time.
