import * as React from "react";
import { describe, expect, it } from "vitest";
import reactify from "../lib/reactify";
import renderToStringAsync from "../lib/internal/renderToStringAsync";
import Dog from "./fixtures/Dog.svelte";

describe("reactify-tsx", () => {
  const svelte = reactify({ Dog }); // in a tsx file, Dog is of type "any"  :-(

  it("renders the Svelte component output into React component", async () => {
    expect(
      await renderToStringAsync(<svelte.Dog name="Fido" />),
    ).toMatchInlineSnapshot(
      `"<reactified style="display:contents"><!--[--><!--[!--><!----><svelte-dog class="svelte-1oslsbm">Fido</svelte-dog><!----><!--]--><!--]--></reactified>"`,
    );
  });
});
