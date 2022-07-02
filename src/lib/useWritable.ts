import type { Updater, Writable } from "svelte/store";
import useReadable from "./useReadable.js";

export default function useWritable<T>(
  store: Writable<T>
): [T, (value: T | Updater<T>) => void] {
  const value = useReadable(store);

  function write(next: T | Updater<T>) {
    if (typeof next === "function") {
      store.update(next as Updater<T>);
    } else {
      store.set(next);
    }
  }

  return [value, write];
}
