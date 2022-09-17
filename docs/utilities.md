# Utilities

svelte-preprocess-react comes with a utilities to make using Svelte primitives inside React components easier.
And to make using React primitives inside Svelte components easier.

## reactify

Convert a Svelte component into an React component.

### Usage:

```ts
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

React only has props, we we asume that the props starting with "on" followed by a capital letter are event handlers.

## useStore

useStore is a React hook that allows using a Svelte Store in a React component.

### Usage:

```ts
import { useStore } from "svelte-preprocess-react";
const userStore = writable({ name: "John Doe" });

const UserGreet: React.FC = () => {
  const $user = useStore(userStore);
  return <h1>Hello, {$user.name}</h1>;
};
export default UserGreet;
```

When the Svelte Store is updated the component will rerender and receive the new value from the useStore hook.

### Writable stores

Inside a Svelte component `$user = { name:'Jane Doe' }` or `$user.name = 'Jane Doe'` will trigger an update.
In React and other regular javascript files this does _not_ work.
To update the value and trigger an update use the `set` or `update` methods:

```ts
// Instead of `$user = { name:'Jane Doe' }`
user.set({ name: "Jane Doe" });

// Instead of `$user.name = 'Jane Doe'`
user.update((user) => ({ ...user, name: "Jane Doe" }));
```

See https://svelte.dev/docs#run-time-svelte-store for more information.
