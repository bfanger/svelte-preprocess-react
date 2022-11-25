import * as React from "react";
import { NavLink } from "$lib/react-router";

type Props = {
  to: string;
  title: string;
};
const MenuItem: React.FC<Props> = ({ to, title }) => {
  return (
    <li>
      <NavLink
        to={to}
        style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}
      >
        {title}
      </NavLink>
    </li>
  );
};

const Menu: React.FC = () => {
  return (
    <ul>
      <MenuItem to="/react-router/home" title="Home" />
      <MenuItem to="about" title="About" />
      <MenuItem to="contact" title="Contact" />
    </ul>
  );
};
export default Menu;
