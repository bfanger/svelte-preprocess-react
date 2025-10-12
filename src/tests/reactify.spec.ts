import { describe, expect, it } from "vitest";
import { expectType } from "tsd";
import * as React from "react";
import reactify from "../lib/reactify";
import Dog from "./fixtures/Dog.svelte";
import Children from "./fixtures/Children.svelte";
import { renderToString } from "react-dom/server";

describe.skip("reactify-ts", () => {
  const svelte = reactify({ Dog, Children });

  it("converts Svelte props into React props", () => {
    expectType<
      React.FC<{
        name: string;
        onbark?: ((sound: string) => void) | undefined;
      }>
    >(svelte.Dog);
    expectType<React.FC<{ children: React.ReactNode }>>(svelte.Children);

    const html = renderToString(
      React.createElement(svelte.Dog, { name: "Fido" }),
    );
    expect(html).toMatchInlineSnapshot(
      `"<reactify-svelte style="display:contents"><!--[--><svelte-dog class="svelte-1oslsbm">Fido</svelte-dog><!--]--></reactify-svelte>"`,
    );
  });

  it("reactify() on the same component returns a identical (cached) react component", () => {
    const DogReact = reactify(Dog);
    expect(svelte.Dog === DogReact).toBeTruthy();
    expectType<typeof svelte.Dog>(DogReact);
  });
});
