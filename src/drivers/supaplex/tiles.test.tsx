import { render } from "@testing-library/react";
import { tiles } from "./tiles";
import { TUnknown } from "./tiles-svg";

it("tiles", () => {
  for (const { value, Component } of tiles) {
    expect(Component === undefined).toBe(value === 0);
    if (Component) {
      const c = render(<Component />);
      c.unmount();
    }
  }

  const u = render(<TUnknown />);
  u.unmount();
});