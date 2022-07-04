/**
 * A react component using a Svelte Button component
 */
import * as React from "react";
import reactify from "../../lib/reactify";
import ButtonSvelte from "../components/Button.svelte";

const Button = reactify(ButtonSvelte);

type Props = {
  initial?: number;
  onCount?: (count: number) => void;
};
const Counter: React.FC<Props> = ({ initial = 0, onCount }) => {
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
      <Button onClick={decrease}>-</Button>
      {count}
      <Button onClick={increase}>+</Button>
    </>
  );
};
export default Counter;
