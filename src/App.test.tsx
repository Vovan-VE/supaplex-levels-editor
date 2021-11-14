import { render } from "@testing-library/react";
import { App } from "./App";

test("renders learn react link", () => {
  const r = render(<App />);
  r.unmount();
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});
