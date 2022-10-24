import { regexpEscape } from "./regexpEscape";

it("Escapes RegExp special chars", () => {
  expect(regexpEscape("`")).toBe("`");
  expect(regexpEscape("~")).toBe("~");
  expect(regexpEscape("!")).toBe("!");
  expect(regexpEscape("@")).toBe("@");
  expect(regexpEscape("#")).toBe("#");
  expect(regexpEscape("$")).toBe("\\$");
  expect(regexpEscape("%")).toBe("%");
  expect(regexpEscape("^")).toBe("\\^");
  expect(regexpEscape("&")).toBe("&");
  expect(regexpEscape("*")).toBe("\\*");
  expect(regexpEscape("()")).toBe("\\(\\)");
  expect(regexpEscape("-")).toBe("\\-");
  expect(regexpEscape("_")).toBe("_");
  expect(regexpEscape("=")).toBe("=");
  expect(regexpEscape("+")).toBe("\\+");
  expect(regexpEscape("\\")).toBe("\\\\");
  expect(regexpEscape("|")).toBe("\\|");
  expect(regexpEscape("[]")).toBe("\\[\\]");
  expect(regexpEscape("{}")).toBe("\\{\\}");
  expect(regexpEscape(";")).toBe(";");
  expect(regexpEscape(":")).toBe(":");
  expect(regexpEscape('"')).toBe('"');
  expect(regexpEscape("'")).toBe("'");
  expect(regexpEscape(",")).toBe(",");
  expect(regexpEscape(".")).toBe("\\.");
  expect(regexpEscape("<>")).toBe("<>");
  expect(regexpEscape("/")).toBe("/");
  expect(regexpEscape("?")).toBe("\\?");

  expect(regexpEscape("Lorem ipsum dolor $50 (30% off!)")).toBe(
    "Lorem ipsum dolor \\$50 \\(30% off!\\)",
  );
});
