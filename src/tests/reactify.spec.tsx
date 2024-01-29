import { describe, expect, it } from "vitest";
import * as React from "react";
import { renderToString } from "react-dom/server";
import reactify from "../../src/lib/reactify";
import DogSvelte from "./fixtures/Dog.svelte";

describe("reactify", () => {
  const Dog = reactify(DogSvelte);
  type ReactProps = React.ComponentProps<typeof Dog>; // in a tsx file, the resulting type is "any"  :-(
  it("renders a svelte-wrapper", () => {
    const props: ReactProps = { name: "Fido", onBark() {} };
    const html = renderToString(<Dog />);
    expect(html).toMatchInlineSnapshot(
      `"<react-portal-target style="display:contents"></react-portal-target>"`,
    );
  });
});
