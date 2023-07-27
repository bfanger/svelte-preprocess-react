# hooks

Using React hooks inside Svelte components.
Because React doesn't have a synchronous render (by-design), the initial value of the store will be `undefined`.

The `hooks()` function uses Svelte lifecycle functions, so you can only call the function during component initialization.

### Usage:

```svelte
<script lang="ts">
  import { hooks } from "svelte-preprocess-react";

  const store = hooks(() => useState(0));
</script>

{#if $store}
  {@const [count, setCount] = $store}
  <h2>Count: {count}</h2>
  <button on:click={() => setCount(count + 1)}>+</button>
{/if}
```

What is returned from the hook becomes the value of the store, so to calling multiple hooks is fine, but [the rules of hooks](https://reactjs.org/docs/hooks-rules.html) still apply.

```ts
const store = hooks(() => {
  const multiplier = useContext(MultiplierContext);
  const [count, setCount] = useState(0);
  return {
    multiply: () => setCount(count * multiplier),
    reset: () => setCount(0),
  };
});

function onReset() {
  $store?.reset();
}
```
