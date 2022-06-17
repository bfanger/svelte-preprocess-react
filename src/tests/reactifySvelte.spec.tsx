import { describe, expect, it } from "vitest";
import * as React from "react";
import { renderToString } from "react-dom/server";
import reactifySvelte from "../lib/reactifySvelte";
import DogSvelte from "./fixtures/Dog.svelte";

describe("reactifySvelte", () => {
  const Dog = reactifySvelte(DogSvelte);
  type ReactProps = React.ComponentProps<typeof Dog>;
  it("renders a svelte-wrapper", () => {
    const props: ReactProps = { name: "Fido", onBark() {} };
    const html = renderToString(<Dog/>);
    expect(html).toMatchInlineSnapshot(
      '"<svelte-wrapper style=\\"display:contents\\"></svelte-wrapper>"'
    );
  });
});
