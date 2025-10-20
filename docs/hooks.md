# hooks

Using React hooks inside Svelte components.

The `hooks()` function uses Svelte lifecycle functions, so you can only call the function during component initialization.

### Usage:

```svelte
<script lang="ts">
  import { hooks } from "svelte-preprocess-react";

  const [count, setCount] = $derived.by(await hooks(() => useState(0)));
</script>

<h2>Count: {count}</h2>
<button onclick={() => setCount(count + 1)}>+</button>
```

hooks() returns a function, when that function retrieves the reactive state, by using $derived.by, the updates from React are applied. Inside the callback you can call multiple hooks, but [the rules of hooks](https://reactjs.org/docs/hooks-rules.html) still apply.

```ts
const actions = $derived.by(
  await hooks(() => {
    const multiplier = useContext(MultiplierContext);
    const [count, setCount] = useState(0);
    return {
      multiply: () => setCount(count * multiplier),
      reset: () => setCount(0),
    };
  }),
);

function onReset() {
  actions.reset();
}
```
