import { useEffect as useLayoutEffect, useState } from "react";
import { get, type Readable } from "svelte/store";

export default function useReadable<T>(store: Readable<T>): T {
  const [value, setValue] = useState(() => get(store));
  useLayoutEffect(() => {
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
