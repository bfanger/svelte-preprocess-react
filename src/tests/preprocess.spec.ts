import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { preprocess } from "svelte/compiler";
import { describe, expect, it } from "vitest";
import preprocessReact from "../lib/preprocessReact";

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

  it("should import 'react-dom/server' when ssr is enabled", async () => {
    const filename = resolveFilename("./fixtures/Container.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(src, preprocessReact({ ssr: true }), {
      filename,
    });
    expect(output.code).toMatch("react-dom/server");
    expect(output.code).toMatchSnapshot();
  });

  it("should not import 'react-dom/server' when ssr is disabled", async () => {
    const filename = resolveFilename("./fixtures/Container.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(src, preprocessReact({ ssr: false }), {
      filename,
    });
    expect(output.code).not.toMatch("react-dom/server");
    expect(output.code).toMatchSnapshot();
  });

  it.skip("should fail on bindings", async () => {
    const filename = resolveFilename("./fixtures/Binding.svelte");
    const src = await readFile(filename, "utf8");
    let failed: boolean;
    try {
      await preprocess(src, preprocessReact(), { filename });
      failed = false;
    } catch (err: any) {
      expect(err.message).toMatchInlineSnapshot(
        "\"'count' is not a valid binding\"",
      );
      failed = true;
    }
    expect(failed).toBe(true);
  });

  it("should portal slotted content as children", async () => {
    const filename = resolveFilename("./fixtures/Slots.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(src, preprocessReact(), { filename });
    expect(output.code).toMatchSnapshot();
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
      preprocessReact({ preprocess: vitePreprocess() }),
      { filename },
    );
    expect(output.code).toMatchSnapshot();
  });
  it("should convert text content to react children prop", async () => {
    const filename = resolveFilename("./fixtures/SlottedText.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(
      src,
      preprocessReact({ preprocess: vitePreprocess() }),
      { filename },
    );
    expect(output.code).toMatchSnapshot();
  });
  it("should process <react:Context.Provider> tags", async () => {
    const filename = resolveFilename("./fixtures/Provider.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(
      src,
      preprocessReact({ preprocess: vitePreprocess() }),
      { filename },
    );
    expect(output.code).toMatchSnapshot();
  });
  it("should process <react:element> (lowercase) tags", async () => {
    const filename = resolveFilename("./fixtures/Element.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(src, preprocessReact(), { filename });
    expect(output.code).toMatchSnapshot();
  });
  it("should process {:else} {:then} and {:catch} sections", async () => {
    const filename = resolveFilename("./fixtures/Blocks.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(
      src,
      preprocessReact({ preprocess: vitePreprocess() }),
      { filename },
    );
    expect(output.code).toMatchSnapshot();
  });
  it("should process on:event forwarding", async () => {
    const filename = resolveFilename("./fixtures/Forwarding.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(
      src,
      preprocessReact({ preprocess: vitePreprocess() }),
      { filename },
    );
    expect(output.code).toMatchSnapshot();
  });

  it("should process <react.Component.Item> tags", async () => {
    const filename = resolveFilename("./fixtures/List.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(src, preprocessReact(), { filename });
    expect(output.code).toMatchSnapshot();
  });

  it("should process {...rest} props", async () => {
    const filename = resolveFilename("./fixtures/RestProps.svelte");
    const src = await readFile(filename, "utf8");
    const output = await preprocess(src, preprocessReact(), { filename });
    expect(output.code).toMatchSnapshot();
  });
});

const base = dirname(fileURLToPath(import.meta.url));
function resolveFilename(filename: string) {
  return resolve(base, filename);
}
