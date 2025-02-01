// @vitest-environment node

import { describe, expect, it } from "vitest";
import * as React from "react";
import { renderToString } from "react-dom/server";
import reactify from "../../src/lib/reactify";
import DogSvelte from "./fixtures/Dog.svelte";

describe("reactify", () => {
  const Dog = reactify(DogSvelte); // in a tsx file, DogSvelte is of type "any"  :-(
  type ReactProps = React.ComponentProps<typeof Dog>;
  it("renders a svelte-wrapper", () => {
    const props: ReactProps = { name: "Fido", onBark() {} };
    const html = renderToString(<Dog {...props} />);
    expect(html).toMatchInlineSnapshot(
      `"<reactify-svelte style="display:contents"><!--[--><svelte-dog class="svelte-1n9pbz6">Fido</svelte-dog><!--]--></reactify-svelte>"`,
    );
  });
});
