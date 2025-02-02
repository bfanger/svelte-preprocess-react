## reactify

Convert a Svelte component into an React component.

### Usage:

```ts
import { reactify } from "svelte-preprocess-react";
import Button from "$lib/components/Button.svelte";

const svelte = reactify({ Button });

type Props = {
  onClose: () => void;
};
const Dialog: React.FC<Props> = ({ onClose }) => (
  <div className="dialog">
    <h2>Thanks for subscribing!</h2>
    <svelte.Button type="primary" onclick={() => onClose()}>
      Close
    </svelte.Button>
  </div>
);
```

## When React starts the rendering, rendering the children is delayed

This is because we want to extract the context from the Svelte component and provide that to the Svelte child components

## Svelte components missing CSS?

This happens when a Svelte component is only used in the React server render and the "external" CSS from the compile step is not injected into the page.

When you're also loading the Svelte components on the page, the bundler will also include the CSS into the page.
Another option is to set the **compilerOptions.css** to "injected".

```js
// svelte.config.js
export default {
  preprocess: [preprocessReact()],
  compilerOptions: {
    css: "injected",
  },
};
```
