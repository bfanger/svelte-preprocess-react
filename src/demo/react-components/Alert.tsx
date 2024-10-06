/**
 * A react component using a Svelte Button component
 */
import * as React from "react";

import $ from "./Alert.module.css";

type Props = {
  type?: "primary";
  children?: React.ReactNode;
};
const Tooltip: React.FC<Props> = ({ type = "primary", children }) => {
  const classNames = [$.alert];
  if (type === "primary") {
    classNames.push($["alert-primary"]);
  }

  return <div className={classNames.join(" ")}>{children}</div>;
};
export default Tooltip;
