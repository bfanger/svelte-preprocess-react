// @vitest-environment happy-dom
import * as React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Link } from "../../lib/react-router";
import TestRouter from "./TestRouter";

describe("<Link> href", () => {
  describe("in a static route", () => {
    it("absolute <Link to> resolves relative to the root URL", () => {
      const { container } = render(
        <TestRouter url="/inbox">
          <Link to="/about" />
        </TestRouter>,
      );
      expect(container.querySelector("a")?.getAttribute("href")).toEqual(
        "/about",
      );
    });
    it('<Link to="."> resolves relative to the current route', () => {
      const { container } = render(
        <TestRouter url="/inbox">
          <Link to="." />
        </TestRouter>,
      );
      expect(container.querySelector("a")?.getAttribute("href")).toEqual(
        "/inbox",
      );
    });
    it('<Link to=".."> resolves relative to the parent route', () => {
      const { container } = render(
        <TestRouter url="/inbox/messages">
          <Link to=".." />
        </TestRouter>,
      );
      expect(container.querySelector("a")?.getAttribute("href")).toEqual(
        "/inbox",
      );
    });
    it('<Link to=".."> with more .. segments than parent routes resolves to the root URL', () => {
      const { container } = render(
        <TestRouter url="/inbox/messages">
          <>
            <Link to="../../about" />
            {/* traverse past the root */}
            <Link to="../../../about" />
          </>
        </TestRouter>,
      );
      expect(
        [...container.querySelectorAll("a")].map((a) => a.getAttribute("href")),
      ).toEqual(["/about", "/about"]);
    });
  });

  describe("in a dynamic route", () => {
    it("absolute <Link to> resolves relative to the root URL", () => {
      const { container } = render(
        <TestRouter url="/inbox/messages/abc">
          <Link to="/about" />
        </TestRouter>,
      );

      expect(container.querySelector("a")?.getAttribute("href")).toEqual(
        "/about",
      );
    });

    it('<Link to="."> resolves relative to the current route', () => {
      const { container } = render(
        <TestRouter url="/inbox/messages/abc">
          <Link to="." />
        </TestRouter>,
      );

      expect(container.querySelector("a")?.getAttribute("href")).toEqual(
        "/inbox/messages/abc",
      );
    });

    // it('<Link to=".."> resolves relative to the parent route', () => {
    //   const { container } = render(
    //     <TestRouter url="/inbox/messages/abc">
    //       <Link to=".." />
    //     </TestRouter>
    //   );

    //   expect(container.querySelector("a")?.getAttribute("href")).toEqual(
    //     "/inbox"
    //   );
    // });

    // it('<Link to=".."> with more .. segments than parent routes resolves to the root URL', () => {
    //   const { container } = render(
    //     <TestRouter url="/inbox/messages/abc">
    //       <Link to="../../about" />
    //     </TestRouter>
    //   );

    //   expect(container.querySelector("a")?.getAttribute("href")).toEqual(
    //     "/about"
    //   );
    // });
  });

  describe("in an index route", () => {
    it("absolute <Link to> resolves relative to the root URL", () => {
      const { container } = render(
        <TestRouter url="/inbox">
          <Link to="/home" />
        </TestRouter>,
      );

      expect(container.querySelector("a")?.getAttribute("href")).toEqual(
        "/home",
      );
    });

    it('<Link to="."> resolves relative to the current route', () => {
      const { container } = render(
        <TestRouter url="/inbox">
          <Link to="." />
        </TestRouter>,
      );

      expect(container.querySelector("a")?.getAttribute("href")).toEqual(
        "/inbox",
      );
    });

    it('<Link to=".."> resolves relative to the parent route (ignoring the index route)', () => {
      const { container } = render(
        <TestRouter url="/inbox">
          <Link to=".." />
        </TestRouter>,
      );

      expect(container.querySelector("a")?.getAttribute("href")).toEqual("/");
    });

    it('<Link to=".."> with more .. segments than parent routes resolves to the root URL', () => {
      const { container } = render(
        <TestRouter url="/inbox">
          <>
            <Link to="../../about" />
            {/* traverse past the root */}
            <Link to="../../../about" />
          </>
        </TestRouter>,
      );

      expect(
        [...container.querySelectorAll("a")].map((a) => a.getAttribute("href")),
      ).toEqual(["/about", "/about"]);
    });
  });

  describe("when using a browser router", () => {
    it("renders proper <a href> for BrowserRouter", () => {
      const { container } = render(
        <TestRouter url="">
          <Link to="/path?search=value#hash" />
        </TestRouter>,
      );
      expect(container.querySelector("a")?.getAttribute("href")).toEqual(
        "/path?search=value#hash",
      );
    });
  });
});
