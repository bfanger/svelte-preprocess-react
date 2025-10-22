import * as React from "react";

/**
 * Hook for using Svelte signals inside a React hook/component.
 * useSignals() accepts a watch function that must be defined in a *.svelte or *.svelte.ts file.
 * When any of the signals change value, the React component will re-render.
 *
 * The useSignal has no return value, because the signal value can already be accessed directly, no need to name the same thing something else.
 *
 * Usage:
 *
 * const user = $state({ name: "John" });
 *
 * const User: React.FC = () => {
 *   useSignals(() => user.name);
 *   return <h1>Hello, {user.name}</h1>;
 * }
 */
export default function useSignals(watch: () => void): void {
  const [, rerender] = React.useState({});
  const initial = React.useRef(true);
  React.useEffect(
    () =>
      $effect.root(() => {
        $effect(() => {
          watch();
          if (initial.current) {
            initial.current = false;
            return;
          }
          rerender({});
        });
      }),
    [],
  );
}
