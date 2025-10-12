/**
 * A react component using a Svelte Button component
 */
import * as React from "react";
import Button from "../../../demo/components/Button.svelte";
import reactifyAsync from "../reactifyAsync";

const svelte = reactifyAsync({ Button });

type CounterProps = {
  initial?: number;
  onCount?: (count: number) => void;
};
const CounterAsync: React.FC<CounterProps> = ({ initial = 0, onCount }) => {
  const [count, setCount] = React.useState(initial);

  function decrease() {
    setCount(count - 1);
    onCount?.(count - 1);
  }
  function increase() {
    setCount(count + 1);
    onCount?.(count + 1);
  }
  return (
    <>
      <svelte.Button onClick={decrease}>-</svelte.Button>
      {count}
      <svelte.Button onClick={increase}>+</svelte.Button>
    </>
  );
};
export default CounterAsync;
