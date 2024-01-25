import * as React from "react";

type Props = {
  count: number;
  onCount: (count: number) => void;
};
const Clicker: React.FC<Props> = ({ count, onCount }) => (
  <div>
    <p data-testid="message">You clicked {count} times</p>
    <button onClick={() => onCount(count + 1)}>+</button>
  </div>
);

export default Clicker;
