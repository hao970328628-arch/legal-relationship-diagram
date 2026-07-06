import { describe, expect, it } from "vitest";
import { getDraggedScrollPosition } from "./pan";

describe("getDraggedScrollPosition", () => {
  it("moves the scroll position opposite to pointer movement", () => {
    expect(
      getDraggedScrollPosition(
        { startClientX: 100, startClientY: 100, startScrollLeft: 300, startScrollTop: 200 },
        { clientX: 140, clientY: 70 },
      ),
    ).toEqual({ scrollLeft: 260, scrollTop: 230 });
  });

  it("does not return negative scroll positions", () => {
    expect(
      getDraggedScrollPosition(
        { startClientX: 100, startClientY: 100, startScrollLeft: 10, startScrollTop: 8 },
        { clientX: 150, clientY: 160 },
      ),
    ).toEqual({ scrollLeft: 0, scrollTop: 0 });
  });
});
