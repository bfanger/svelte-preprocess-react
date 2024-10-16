/**
 * A react component using a Svelte Button component
 */
import * as React from "react";

import $ from "./Alert.module.css";

type AlertProps = {
  type?: "primary";
  children?: React.ReactNode;
};
const Tooltip: React.FC<AlertProps> = ({ type = "primary", children }) => {
  const classNames = [$.alert];
  if (type === "primary") {
    classNames.push($["alert-primary"]);
  }

  return <div className={classNames.join(" ")}>{children}</div>;
};
export default Tooltip;
