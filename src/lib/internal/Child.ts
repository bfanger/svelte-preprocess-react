import * as React from "react";
import portalTag from "svelte-preprocess-react/internal/portalTag";

type Props = {
  nodeKey: string;
  el: HTMLElement | undefined;
};
const Child: React.FC<Props> = ({ nodeKey, el }) => {
  const ref = React.useRef<HTMLElement>(undefined);
  React.useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (el) {
      el.style.display = "contents";
      ref.current.appendChild(el);
    }
  }, [ref, el]);
  return React.createElement(
    portalTag("react", "children", "target", nodeKey),
    {
      ref,
      style: { display: "contents" },
    },
  );
};
export default Child;
