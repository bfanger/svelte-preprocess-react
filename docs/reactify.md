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
    <svelte.Button type="primary" onClick={() => onClose()}>
      Close
    </svelte.Button>
  </div>
);
```

React only has props, we we assume that the props starting with "on" followed by a capital letter are event handlers.

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
