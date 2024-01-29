import * as React from "react";

type Props = {
  node: string;
  el: HTMLElement | undefined;
};
const Child: React.FC<Props> = ({ node, el }) => {
  const ref = React.useRef<HTMLElement>();
  React.useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (el) {
      // eslint-disable-next-line no-param-reassign
      el.style.display = "contents";
      ref.current.appendChild(el);
    }
  }, [ref, el]);
  return React.createElement("react-children-target", {
    ref,
    node,
    style: { display: "contents" },
  });
};
export default Child;
