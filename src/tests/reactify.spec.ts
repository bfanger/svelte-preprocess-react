import * as React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import reactify from "../lib/reactify";
import DogSvelte from "./fixtures/Dog.svelte";

describe("reactify", () => {
  const Dog = reactify(DogSvelte);
  type ReactProps = React.ComponentProps<typeof Dog>;
  it("renders a svelte-wrapper", () => {
    const props: ReactProps = { name: "Fido", onBark() {} };
    const html = renderToString(React.createElement(Dog, props));
    expect(html).toMatchInlineSnapshot(
      `"<react-portal-target style="display:contents"></react-portal-target>"`,
    );
  });
});
