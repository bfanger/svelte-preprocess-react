import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { NavLink } from "../../lib/react-router";
import TestRouter from "./TestRouter";

describe("NavLink (react-router v6)", () => {
  describe("when it does not match", () => {
    it("does not apply an 'active' className to the underlying <a>", async () => {
      const { container } = render(
        <TestRouter url="/home">
          <NavLink to="somewhere-else">Somewhere else</NavLink>
        </TestRouter>
      );
      const anchor = container.querySelector("a");
      expect(anchor?.className).not.toMatch("active");
    });
    it("does not change the content inside the <a>", () => {
      const { container } = render(
        <TestRouter url="/home">
          <NavLink to="somewhere-else">
            {({ isActive }) => (isActive ? "Current" : "Somewhere else")}
          </NavLink>
        </TestRouter>
      );

      const anchor = container.querySelector("a");
      expect(anchor?.textContent).toMatch("Somewhere else");
    });
    it("applies an 'undefined' className to the underlying <a>", () => {
      const { container } = render(
        <TestRouter url="/home">
          <NavLink
            to="somewhere-else"
            className={({ isActive }) =>
              isActive ? "some-active-classname" : undefined
            }
          >
            Home
          </NavLink>
        </TestRouter>
      );
      const anchor = container.querySelector("a");
      expect(anchor?.className).toBe("");
    });
  });

  describe("when it matches to the end", () => {
    it("applies the default 'active' className to the underlying <a>", () => {
      const { container } = render(
        <TestRouter url="/home">
          <NavLink to=".">Home</NavLink>
        </TestRouter>
      );
      const anchor = container.querySelector("a");
      expect(anchor?.className).toMatch("active");
    });

    it("applies its className correctly when provided as a function", () => {
      const { container } = render(
        <TestRouter url="/home">
          <NavLink
            to="."
            className={({ isActive }) =>
              `nav-link${isActive ? " highlighted" : " plain"}`
            }
          >
            Home
          </NavLink>
        </TestRouter>
      );
      const anchor = container.querySelector("a");
      expect(anchor?.className.includes("nav-link")).toBe(true);
      expect(anchor?.className.includes("highlighted")).toBe(true);
      expect(anchor?.className.includes("plain")).toBe(false);
    });
    it("applies its style correctly when provided as a function", () => {
      const { container } = render(
        <TestRouter url="/home">
          <NavLink
            to="."
            style={({ isActive }) =>
              isActive ? { textTransform: "uppercase" } : {}
            }
          >
            Home
          </NavLink>
        </TestRouter>
      );
      const anchor = container.querySelector("a");
      expect(anchor?.style).toMatchObject({ textTransform: "uppercase" });
    });
    it("applies its children correctly when provided as a function", () => {
      const { container } = render(
        <TestRouter url="/home">
          <NavLink to=".">
            {({ isActive }) => (isActive ? "Home (current)" : "Home")}
          </NavLink>
        </TestRouter>
      );
      const anchor = container.querySelector("a");
      expect(anchor?.textContent).toMatch("Home (current)");
    });
  });

  describe("when it matches a partial URL segment", () => {
    it("does not apply the 'active' className to the underlying <a>", () => {
      const { container } = render(
        <TestRouter url="/home/children">
          <NavLink to="child">Home</NavLink>
        </TestRouter>
      );
      const anchor = container.querySelector("a");
      expect(anchor?.className).not.toMatch("active");
    });
    it("does not match when <Link to> path is a subset of the active url", () => {
      const { container } = render(
        <TestRouter url="/user-preferences">
          <NavLink to="user">Go to /user</NavLink>
          <NavLink to="user-preferences">Go to /user-preferences</NavLink>
        </TestRouter>
      );
      const anchors = [...container.querySelectorAll("a")];
      expect(anchors.map((a) => a.className)).toEqual(["", "active"]);
    });
    it("does not match when active url is a subset of a <Route path> segment", () => {
      const { container } = render(
        <TestRouter url="/user">
          <div>
            <NavLink to="user">Go to /user</NavLink>
            <NavLink to="user-preferences">Go to /user-preferences</NavLink>
          </div>
        </TestRouter>
      );
      const anchors = [...container.querySelectorAll("a")];
      expect(anchors.map((a) => a.className)).toEqual(["active", ""]);
    });
  });
});
