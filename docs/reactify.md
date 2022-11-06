## reactify

Convert a Svelte component into an React component.

### Usage:

```ts
import { reactify } from "svelte-preprocess-react";
import ButtonSvelte from "$lib/components/Button.svelte";

const Button = reactify(ButtonSvelte);

type Props = {
  onClose: () => void;
};
const Dialog: React.FC<Props> = ({ onClose }) => (
  <div className="dialog">
    <h2>Thanks for subscribing!</h2>
    <Button type="primary" onClick={() => onClose()}>
      Close
    </Button>
  </div>
);
```

React only has props, we we assume that the props starting with "on" followed by a capital letter are event handlers.
