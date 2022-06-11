# Svelte Preprocess React

Seamlessly use React components inside a Svelte app

# "Embrace, extend, and extinguish"

This preprocessor is intended as temporary solution when migrating an existing large React codebase.  
The goal should be to rewrite all the components to Svelte and remove this preprocessor from your setup.

## Usage inside Svelte components

```html
<script>
  import MyReactComponent from "./MyReactComponent.jsx";
</script>

<react:MyReactComponent />
```

The preprocessor compiles this to:

```html
<script>
  import sveltifyReact from "svelte-preprocess-react/sveltifyReact18";
  import MyReactComponent from "./MyReactComponent.jsx";

  const React$MyReactComponent = sveltifyReact(MyReactComponent);
</script>

<React$MyReactComponent />
```

## Setup

```sh
npm install svelte-preprocess-react
```

```js
// svelte.config.js
import preprocessReact from "svelte-preprocess-react";

export default {
  preprocess: preprocessReact(),
};
```

When setting up in combination with other processors like [svelte-preprocess]() use:

```js
// svelte.config.js
import preprocess from "svelte-preprocess";
import preprocessReact from "svelte-preprocess-react";

export default {
  preprocess: preprocessReact(preprocess: preprocess({ sourceMap: true })),
};
```

svelte-preprocess-react is a _markup_ preprocessor, which messes up the preprocess ordering.
Passing the other preprocessor as option ensures that this run before the react preprocessor.

## Using Svelte components in React

```ts
import reactifySvelte from "$lib/reactifySvelte";
import ButtonSvelte from "../components/Button.svelte";

const Button = reactifySvelte(ButtonSvelte);

function MyComponent() {
  return <Button onClick={() => console.log("clicked")}>Click me</Button>;
}
```
