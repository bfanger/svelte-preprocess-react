import * as React from "react";

type Props = {
  slot: HTMLElement | undefined;
};
const SvelteSlot: React.FC<Props> = ({ slot }) => {
  const ref = React.useRef<HTMLElement>();
  React.useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (slot) {
      // eslint-disable-next-line no-param-reassign
      slot.style.display = "contents";
      ref.current.appendChild(slot);
    }
  }, [ref, slot]);
  return React.createElement("svelte-slot", {
    ref,
    style: { display: "contents" },
  });
};
export default SvelteSlot;
