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

function ListItem({ label, children }: ItemProps) {
  return (
    <li className="list__item">
      {label}
      {children}
    </li>
  );
}
type IconProps = {
  icon: string;
};
ListItem.Icon = ({ icon }: IconProps) => {
  return <i className="list__icon">{icon}</i>;
};

List.Item = ListItem;
