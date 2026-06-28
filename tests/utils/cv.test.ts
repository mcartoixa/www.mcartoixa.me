import { describe, it, expect } from "vitest";
import { sanitize, formatDate } from "../../src/utils/cv.js";

describe("formatDate", () => {
  it("formats a Date as a YYYY-MM-DD string", () => {
    expect(formatDate(new Date("2020-09-14T12:34:56Z"))).toBe("2020-09-14");
  });
});

describe("sanitize", () => {
  it("formats Date values as YYYY-MM-DD strings by default", () => {
    const o = { startDate: new Date("2020-09-14T12:34:56Z") };
    expect(sanitize(o).startDate).toBe("2020-09-14");
  });

  it("keeps Date values as Dates when formatDates is false", () => {
    const date = new Date("2020-09-14T12:34:56Z");
    const o = { startDate: date };
    const result = sanitize(o, undefined, false);
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.startDate).toEqual(date);
  });

  it("strips markup from string values", () => {
    const o = { summary: "<p>Hello <b>world</b></p>" };
    expect(sanitize(o).summary).toBe("Hello world");
  });

  it("recurses into nested objects", () => {
    const o = { basics: { name: "<i>Bob</i>" } };
    expect(sanitize(o).basics.name).toBe("Bob");
  });

  it("recurses into arrays", () => {
    const o = { highlights: ["<b>first</b>", "<b>second</b>"] };
    expect(sanitize(o).highlights).toEqual(["first", "second"]);
  });

  it("leaves non-string, non-Date leaves untouched", () => {
    const o = { count: 3, enabled: true };
    expect(sanitize(o)).toEqual({ count: 3, enabled: true });
  });

  it("returns a sanitised copy without mutating the input", () => {
    const input = { name: "<b>plain</b>" };
    const result = sanitize(input);
    expect(result).not.toBe(input);
    expect(input.name).toBe("<b>plain</b>");
    expect(result.name).toBe("plain");
  });

  it("forwards convert options", () => {
    const o = { link: '<a href="https://example.com">text</a>' };
    const sanitized = sanitize(o, {
      selectors: [{ selector: "a", options: { ignoreHref: true } }],
    });
    expect(sanitized.link).toBe("text");
  });
});
