import * as React from "react";

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
      <button onClick={decrease}>-</button>
      {count}
      <button onClick={increase}>+</button>
    </>
  );
};
export default Counter;
