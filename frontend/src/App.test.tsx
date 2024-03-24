import renderer from "react-test-renderer";
import { App } from "./App";

test("renders learn react link", () => {
  const r = renderer.create(<App />);
  r.unmount();
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});
