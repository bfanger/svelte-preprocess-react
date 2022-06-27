import { useEffect, useState } from "react";
import { get, type Readable } from "svelte/store";

export default function useReadable<T>(store: Readable<T>): T {
  const [value, setValue] = useState(() => get(store));
  useEffect(() => {
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
