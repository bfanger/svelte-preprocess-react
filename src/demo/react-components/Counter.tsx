import * as React from "react";

type Props = {
  initialValue: number;
};
const Counter: React.FC<Props> = ({ initialValue = 0 }) => {
  const [count, setCount] = React.useState(initialValue);
  function decrease() {
    setCount(count - 1);
  }
  function increase() {
    setCount(count + 1);
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
