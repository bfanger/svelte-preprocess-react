# Svelte Preprocess React

Seamlessly use React components inside a Svelte app

# "Embrace, extend, and extinguish"

This preprocessor is intended as temporary solution when migrating an existing large React codebase.  
The goal should be to rewrite all the components to Svelte and remove this preprocessor from your setup.

## Using React inside Svelte components

> Embrace

Inside the Svelte template prepend the name of the component with `react:` prefix.

Instead of `<Button>`, you'd write `<react:Button>`

```html
<script>
  import MyReactComponent from "./MyReactComponent.jsx";
</script>

<react:MyReactComponent />
```

The preprocessor compiles this to:

```html
<script>
  import sveltifyReact from "svelte-preprocess-react/sveltifyReact";
  import { createElement } from "react";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { renderToString } from "react-dom/server";
  import MyReactComponent from "./MyReactComponent.jsx";

  const React$MyReactComponent = sveltifyReact(
    MyReactComponent,
    createElement,
    createPortal,
    ReactDOM,
    renderToString
  );
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

When using other processors like [svelte-preprocess]() use:

```js
// svelte.config.js
import preprocess from "svelte-preprocess";
import preprocessReact from "svelte-preprocess-react";

export default {
  preprocess: preprocessReact({
    preprocess: preprocess({ sourceMap: true }),
  }),
};
```

svelte-preprocess-react is a _markup_ preprocessor, these runs before _script_ preprocessors,
Passing the other preprocessor as option ensures that this preprocessor runs before the preprocessReact.

## Using Svelte inside React components

> Extend

Once you've converted a React component to Svelte, you'd want delete that React component, but some if other React components depended on that react component you can use `reactifySvelte` to use the new Svelte component as a React component.

```ts
import reactifySvelte from "$lib/reactifySvelte";
import ButtonSvelte from "../components/Button.svelte";

const Button = reactifySvelte(ButtonSvelte);

function MyComponent() {
  return <Button onClick={() => console.log("clicked")}>Click me</Button>;
}
```

## Using multiple frameworks is a bad idea

> Extinguish

Using multiple frontend frameworks add overhead both in User and Developer experience.

- Increased download size
- Slower (each framework boundry adds overhead)
- Context switching, keeping the intricacies of both Svelte and React in your head slows down development

svelte-preprocess-react is a migraton tool, it can be used to migrate _from_ or _to_ React, it's not a long term solution.
