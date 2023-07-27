import * as React from "react";
import { NavLink } from "svelte-preprocess-react/react-router";

type Props = {
  to: string;
  title: string;
};
const MenuItem: React.FC<Props> = ({ to, title }) => (
  <li>
    <NavLink
      to={to}
      style={({ isActive }) => ({ fontWeight: isActive ? "bold" : "normal" })}
    >
      {title}
    </NavLink>
  </li>
);

const Menu: React.FC = () => (
  <ul>
    <MenuItem to="/react-router/home" title="Home" />
    <MenuItem to="about" title="About" />
    <MenuItem to="contact" title="Contact" />
  </ul>
);
export default Menu;
