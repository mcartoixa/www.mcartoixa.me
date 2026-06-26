import { describe, it, expect } from "vitest";
import { resolveImageSrc } from "../../src/utils/blog.core.js";

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
