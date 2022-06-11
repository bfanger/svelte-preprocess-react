export default function Clicker({ count, onCount }) {
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => onCount(count + 1)}>+</button>
    </div>
  );
}
