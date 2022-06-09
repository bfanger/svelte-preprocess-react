import { describe, expect, it } from "vitest";
import { preprocess } from "svelte/compiler";
import preprocessReact from "../lib/svelte-preprocess-react";
import source from "./fixtures/Container.svelte?raw";

describe("preprocess-react", () => {
  it("should process <react:component> tags", async () => {
    const output = await preprocess(source, preprocessReact(), {
      filename: "Counter.svelte",
    });
    expect(output.code).toMatchSnapshot();
  });
});
