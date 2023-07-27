import { describe, expect, it } from "vitest";
import locationToUrl from "../../lib/react-router/internal/locationToUrl";

describe("locationToUrl", () => {
  it("absolute urls", () => {
    expect(`${locationToUrl("/foo")}`).toBe("/foo");
    expect(`${locationToUrl("/foo?arg=1#hash")}`).toBe("/foo?arg=1#hash");
    expect(
      `${locationToUrl("/foo", new URL("https://example.com/test/123"))}`,
    ).toBe("/foo");
  });
  it(". should return the current absolute url", () => {
    const base = new URL("https://example.com/path");
    expect(`${locationToUrl(".", base)}`).toBe("/path");
  });
  it("same folder", () => {
    const base = new URL("https://example.com/folder/filename");
    expect(`${locationToUrl("file2", base)}`).toBe("/folder/file2");
    expect(`${locationToUrl("./abc", base)}`).toBe("/folder/abc");
  });
  it("up level", () => {
    const base = new URL("https://example.com/folder1/folder2/filename");
    expect(`${locationToUrl("..", base)}`).toBe("/folder1/folder2");
    expect(`${locationToUrl("../xyz", base)}`).toBe("/folder1/xyz");
    expect(`${locationToUrl("../../abc", base)}`).toBe("/abc");
    expect(`${locationToUrl("../../../abc", base)}`).toBe("/abc"); // too much
  });
});
