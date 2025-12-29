import * as React from "react";

type Props = {
  isOpened: boolean;
  children?: React.ReactNode;
  onOpen: () => void;
  onClose: () => void;
};
export default function Accordion({
  isOpened,
  children,
  onOpen,
  onClose,
}: Props) {
  return (
    <div
      style={{ width: "max-content", border: "1px solid gray", padding: "8px" }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}
      >
        Accordion
        {isOpened ? (
          <button onClick={onClose}>^</button>
        ) : (
          <button onClick={onOpen}>V</button>
        )}
      </div>
      {isOpened && <div>{children}</div>}
    </div>
  );
}
