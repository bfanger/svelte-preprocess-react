import * as React from "react";
import portalTag from "./portalTag";
import SvelteToReactContext from "./SvelteToReactContext";

type Props = {
  slot: number;
};
const Slot: React.FC<Props> = ({ slot }) => {
  const node = React.useContext(SvelteToReactContext);
  const ref = React.useRef<HTMLElement>();
  const el = node?.slotSources[slot];
  React.useEffect(() => {
    if (!ref.current || ref.current.children.length > 0) {
      return;
    }
    if (el) {
      el.style.display = "contents";
      ref.current.appendChild(el);
    }
  }, [ref, node]);
  if (!node) {
    return null;
  }
  return React.createElement(
    portalTag("react", `slot${slot}`, "target", node.key),
    {
      ref,
      style: { display: "contents" },
    },
  );
};
export default Slot;
