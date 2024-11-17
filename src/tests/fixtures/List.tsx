import * as React from "react";

type Props = {
  children: React.ReactNode;
};
export default function List({ children }: Props) {
  return <ul className="list">{children}</ul>;
}

type ItemProps = {
  label: string;
  children: React.ReactNode;
};

List.Item = ({ label, children }: ItemProps) => {
  return (
    <li className="list__item">
      {label}
      {children}
    </li>
  );
};
