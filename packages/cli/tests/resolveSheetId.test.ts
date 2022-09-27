import { describe, it, expect } from "vitest";
import { resolveSheetId } from "../src/shared/resolveSheetId";

describe("resolveSheetId", () => {
  it("should resolve sheet id from url", function () {
    const resolved = resolveSheetId(
      "https://docs.google.com/spreadsheets/d/1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk/edit#gid=1740568548"
    );
    expect(resolved).toBe("1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk");
  });
  it("should resolve sheet from string", function () {
    const resolved = resolveSheetId(
      "1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk"
    );
    expect(resolved).toBe("1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk");
  });
  it("should return same while resolve failed", function () {
    expect(resolveSheetId()).toBeUndefined();
  });
});
