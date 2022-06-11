import { describe, expect, it } from "vitest";
import { preprocess } from "svelte/compiler";
import sveltePreprocess from "svelte-preprocess";
import { readFile } from "fs/promises";
import { dirname, resolve } from "path";
import preprocessReact from "../lib/preprocess";

describe("svelte-preprocess-react", () => {
  it("should process <react:component> tags", async () => {
    const filename = resolveFilename("./fixtures/Container.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(src, preprocessReact(), { filename });
    expect(output.code).toMatchSnapshot();
  });
  it("should process <react:component> tags", async () => {
    const filename = resolveFilename("./fixtures/Multiple.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(src, preprocessReact(), { filename });
    expect(output.code).toMatchSnapshot();
  });

  it("should fail on bindings", async () => {
    const filename = resolveFilename("./fixtures/Binding.svelte");
    const src = await readFile(filename, "utf8");
    let failed: boolean;
    try {
      await preprocess(src, preprocessReact(), { filename });
      failed = false;
    } catch (err: any) {
      expect(err.message).toMatchSnapshot();
      failed = true;
    }
    expect(failed).toBe(true);
  });

  it("should fail on slots (for now)", async () => {
    const filename = resolveFilename("./fixtures/Slots.svelte");
    const src = await readFile(filename, "utf8");
    let failed: boolean;
    try {
      await preprocess(src, preprocessReact(), { filename });
      failed = false;
    } catch (err: any) {
      expect(err.message).toBe(
        "Nested components are not (yet) supported in svelte-preprocess-react"
      );
      failed = true;
    }
    expect(failed).toBe(true);
  });

  it("should inject a script tag", async () => {
    const filename = resolveFilename("./fixtures/NoScript.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(src, preprocessReact(), { filename });
    expect(output.code).toContain("<script>");
    expect(output.code).toMatchSnapshot();
  });

  it("should support typescript when using preprocess", async () => {
    const filename = resolveFilename("./fixtures/Typescript.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(
      src,
      preprocessReact({ preprocess: sveltePreprocess() }),
      { filename }
    );
    expect(output.code).toMatchSnapshot();
  });
});

const base = dirname(import.meta.url).replace("file://", "");
function resolveFilename(filename: string) {
  return resolve(base, filename);
}
