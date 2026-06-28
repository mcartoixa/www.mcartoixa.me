import { describe, it, expect } from "vitest";
import {
  resolveImageSrc,
  rewriteMarkdownImageSources,
} from "../../src/utils/blog.core.js";

const img = { tag: "img" };

describe("resolveImageSrc", () => {
  it("prefixes a year directory for a relative link with a ./ prefix", () => {
    expect(resolveImageSrc("./2026-03-31-foo.png", img)).toBe(
      "/assets/images/2026/2026-03-31-foo.png"
    );
  });

  it("prefixes a year directory for a relative link without a ./ prefix", () => {
    expect(resolveImageSrc("2026-06-26-afdp1228.jpg", img)).toBe(
      "/assets/images/2026/2026-06-26-afdp1228.jpg"
    );
  });

  it("leaves an absolute URL untouched", () => {
    expect(
      resolveImageSrc("https://faasandfurious.com/pages/family-tensions.png", img)
    ).toBe("https://faasandfurious.com/pages/family-tensions.png");
  });

  it("leaves a data URI untouched", () => {
    expect(resolveImageSrc("data:image/png;base64,iVBORw0KGgo=", img)).toBe(
      "data:image/png;base64,iVBORw0KGgo="
    );
  });

  it("does not add a year directory when the file name has no leading year", () => {
    expect(resolveImageSrc("./logo.svg", img)).toBe("/assets/images/logo.svg");
  });

  it("leaves non-image links untouched", () => {
    expect(resolveImageSrc("./2026-03-31-foo.png", { tag: "a" })).toBe(
      "./2026-03-31-foo.png"
    );
  });

  it("leaves the link untouched when there is no token", () => {
    expect(resolveImageSrc("./2026-03-31-foo.png", undefined)).toBe(
      "./2026-03-31-foo.png"
    );
  });
});

describe("rewriteMarkdownImageSources", () => {
  it("rewrites a relative image source while leaving its alt text intact", () => {
    expect(rewriteMarkdownImageSources("![the alt](./2026-03-31-foo.png)")).toBe(
      "![the alt](/assets/images/2026/2026-03-31-foo.png)"
    );
  });

  it("rewrites the image but not the surrounding link target", () => {
    expect(
      rewriteMarkdownImageSources(
        "[![afdp1228](2026-06-26-afdp1228.jpg)](https://adamfairhead.com/p1228/)"
      )
    ).toBe(
      "[![afdp1228](/assets/images/2026/2026-06-26-afdp1228.jpg)](https://adamfairhead.com/p1228/)"
    );
  });

  it("leaves an absolute image source untouched", () => {
    const markdown = "![family](https://faasandfurious.com/pages/family-tensions.png)";
    expect(rewriteMarkdownImageSources(markdown)).toBe(markdown);
  });

  it("preserves an image title alongside the rewritten source", () => {
    expect(
      rewriteMarkdownImageSources('![alt](./2026-03-31-foo.png "a title")')
    ).toBe('![alt](/assets/images/2026/2026-03-31-foo.png "a title")');
  });

  it("rewrites every image in a multi-line document", () => {
    const markdown = [
      "# Title",
      "",
      "![one](./2026-03-31-one.png)",
      "",
      "Some prose with a [normal link](./2026-03-31-not-an-image.png).",
      "",
      "![two](2026-06-26-two.jpg)",
    ].join("\n");
    const expected = [
      "# Title",
      "",
      "![one](/assets/images/2026/2026-03-31-one.png)",
      "",
      "Some prose with a [normal link](./2026-03-31-not-an-image.png).",
      "",
      "![two](/assets/images/2026/2026-06-26-two.jpg)",
    ].join("\n");
    expect(rewriteMarkdownImageSources(markdown)).toBe(expected);
  });
});
