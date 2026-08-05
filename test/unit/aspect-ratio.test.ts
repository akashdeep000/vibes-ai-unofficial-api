import { describe, expect, it } from "vitest";
import { dimensionsToAspectRatio, resolveAspectRatio } from "../../src/utils/aspect-ratio.js";

describe("dimensionsToAspectRatio", () => {
  it("maps 9:16 portrait", () => {
    expect(dimensionsToAspectRatio({ width: 720, height: 1280 })).toBe("9:16");
    expect(dimensionsToAspectRatio({ width: 1080, height: 1920 })).toBe("9:16");
  });

  it("maps 16:9 landscape", () => {
    expect(dimensionsToAspectRatio({ width: 1280, height: 720 })).toBe("16:9");
  });

  it("maps square", () => {
    expect(dimensionsToAspectRatio({ width: 1024, height: 1024 })).toBe("1:1");
  });

  it("defaults to 9:16 for invalid dimensions", () => {
    expect(dimensionsToAspectRatio({ width: 0, height: 0 })).toBe("9:16");
  });

  it("picks the closest known ratio for odd sizes", () => {
    expect(dimensionsToAspectRatio({ width: 1600, height: 900 })).toBe("16:9");
  });
});

describe("resolveAspectRatio", () => {
  it("prefers the image dimensions over the requested ratio", () => {
    expect(resolveAspectRatio({ width: 1280, height: 720 }, "9:16")).toBe("16:9");
  });

  it("falls back to the requested ratio when dimensions are unknown", () => {
    expect(resolveAspectRatio(undefined, "9:16")).toBe("9:16");
  });

  it("defaults to 9:16 when nothing is known", () => {
    expect(resolveAspectRatio(undefined, undefined)).toBe("9:16");
  });
});
