import * as React from "react";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  component?: React.ComponentType<any> | undefined;
  to: string | Location | ((location: Location) => Location);
  replace?: boolean;
  innerRef?: React.Ref<HTMLAnchorElement> | undefined;
};

const Link: React.FC<Props> = ({
  component = "a",
  to,
  replace,
  innerRef,
  children,
  ...attrs
}) => {
  const href = to ?? attrs.href;
  return React.createElement(
    component,
    { ref: innerRef, ...attrs, href },
    children
  );
};
export default Link;
