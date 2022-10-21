import * as React from "react";
import { get, type Readable } from "svelte/store";

/**
 * Hook for using Svelte stores in React.
 *
 * Usage:
 *
 * const User: React.FC = () => {
 *   const $user = useStore(userStore);
 *   return <h1>Hello, {$user.name}</h1>;
 * }
 */
export default function useStore<T>(store: Readable<T>): T {
  const [value, setValue] = React.useState(() => get(store));
  React.useEffect(() => {
    let first = true;
    const cancel = store.subscribe((next) => {
      if (first) {
        first = false;
        if (next === value) {
          return;
        }
      }
      setValue(next);
    });
    return cancel;
  }, [store]);
  return value;
}
