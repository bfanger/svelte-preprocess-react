import * as React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import reactify from "../lib/reactify";
import Dog from "./fixtures/Dog.svelte";

describe("reactify-tsx", () => {
  const svelte = reactify({ Dog }); // in a tsx file, Dog is of type "any"  :-(

  it("renders the Svelte component output into React", () => {
    expect(renderToString(<svelte.Dog name="Fido" />)).toMatchInlineSnapshot(
      `"<reactify-svelte style="display:contents"><!--[--><svelte-dog class="svelte-1n9pbz6">Fido</svelte-dog><!--]--></reactify-svelte>"`,
    );
  });
});
