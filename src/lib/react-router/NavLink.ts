import * as React from "react";
import Link from "./Link.js";
import useLocation from "./useLocation.js";
import type { Location } from "./types";

type LinkProps = React.ComponentProps<typeof Link>;
type Props = Omit<LinkProps, "className" | "style"> & {
  activeClassName?: string | undefined;
  activeStyle?: React.CSSProperties | undefined;
  exact?: boolean | undefined;
  strict?: boolean | undefined;
  isActive?(match: unknown, location: Location): boolean;
  location?: Location | undefined;
  className?: string | ((isActive: boolean) => string) | undefined;
  style?:
    | React.CSSProperties
    | ((isActive: boolean) => React.CSSProperties)
    | undefined;
  sensitive?: boolean | undefined;
};

const NavLink: React.FC<Props> = ({
  exact,
  strict,
  isActive,
  location,
  activeStyle,
  activeClassName,
  className,
  style,
  children,
  ...rest
}) => {
  const attrs: LinkProps = { ...rest };
  if (typeof attrs.to !== "string") {
    throw new Error("NavLink only supports string locations");
  }

  const { pathname } = useLocation();
  const active = exact ? pathname === attrs.to : pathname.startsWith(attrs.to);

  if (active) {
    if (activeClassName) {
      attrs.className = attrs.className
        ? `${attrs.className} ${activeClassName}`
        : activeClassName;
    }
    if (activeStyle) {
      attrs.style = attrs.style
        ? { ...attrs.style, ...activeStyle }
        : activeStyle;
    }
  }
  return React.createElement(Link, attrs, children);
};
export default NavLink;
