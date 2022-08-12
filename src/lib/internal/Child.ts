import { useRef, useEffect, createElement, type FC } from "react";

type Props = {
  el: HTMLElement | undefined;
};
const Child: FC<Props> = ({ el }) => {
  const ref = useRef<HTMLElement>();
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (el) {
      // eslint-disable-next-line no-param-reassign
      el.style.display = "contents";
      ref.current.appendChild(el);
    }
  }, [ref, el]);
  return createElement("react-child", {
    ref,
    style: { display: "contents" },
  });
};
export default Child;
