import * as React from "react";
import Link, { type LinkProps } from "./Link.js";
import useRouterContext from "./internal/useRouterContext.js";
import locationToUrl from "./internal/locationToUrl.js";
import type { RouteCondition } from "./types.js";

export type NavLinkProps = Omit<
  LinkProps,
  "className" | "style" | "children"
> & {
  children?: React.ReactNode | ((condition: RouteCondition) => React.ReactNode);
  className?: string | ((condition: RouteCondition) => string | undefined);
  style?:
    | React.CSSProperties
    | ((condition: RouteCondition) => React.CSSProperties | undefined);
};
const NavLink: React.FC<NavLinkProps> = ({
  className,
  style,
  children,
  ...rest
}) => {
  const context = useRouterContext();
  const attrs: LinkProps = rest;
  const target = locationToUrl(attrs.to, context.base).toString();
  const current = locationToUrl(context.location, context.base).toString();
  const isActive = target === current;
  const condition: RouteCondition = { isActive };
  if (typeof className === "function") {
    attrs.className = className(condition);
  } else if (isActive) {
    attrs.className = className ? `${className} active` : "active";
  } else {
    attrs.className = className;
  }

  attrs.style = typeof style === "function" ? style(condition) : style;

  return React.createElement(
    Link,
    attrs,
    typeof children === "function" ? children(condition) : children
  );
};
export default NavLink;
