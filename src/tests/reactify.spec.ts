// @vitest-environment node

import * as React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import reactify from "../lib/reactify";
import Dog from "./fixtures/Dog.svelte";

describe("reactify", () => {
  const svelte = reactify({ Dog });
  type ReactProps = React.ComponentProps<typeof svelte.Dog>;

  it("renders a svelte-wrapper", () => {
    const props: ReactProps = { name: "Fido", onbark() {} };
    const html = renderToString(React.createElement(svelte.Dog, props));
    expect(html).toMatchInlineSnapshot(
      `"<reactify-svelte style="display:contents"><!--[--><svelte-dog class="svelte-1n9pbz6">Fido</svelte-dog><!--]--></reactify-svelte>"`,
    );
  });
  it("caches the conversion component", () => {
    const DogReact = reactify(Dog);
    expect(DogReact).toBe(svelte.Dog);
    const svelte2 = reactify({ Dog });
    expect(svelte2.Dog === DogReact).toBeTruthy();
  });
});
