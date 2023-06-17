# TODO

## Internal

- Toasts.
  - Internal editing exception from store manipulations.
- WpColEd porting:
  - Import/export single level:
    - with real clipboard (binary file with level or special json);
    - with internal buffer in browser storage.
  - Export/copy level body/selection as image.
- Compare levels.
- End User Manual.
  - Find or create jekyll template.
- Draggable files buttons to reorder many opened files.
- Tools:
  - Circle
- Presets in Selection Editors
- Visualized level resizing with crop.
  - Separate "crop" & "extend" scenarios with Tabs, for example.
- Convert format config: SP: Which level to take.
- Drag-n-drop open files
  - Desktop: cannot handle from backend to get real file path
- Demo path visualization
  - Impossible without gameplay simulation. Only if SO will provide a path
    actually walked.
- CompressionStream for test (no support in libwebkit)
  `TVBYIAEAAQAMAAsAFQAAADUBAAAGBgYGBgYGBgYGBgYGBwAAAAAAAAAAAAYGAAAAAAAAAAAAAAYGAAAAAAAAAAAAAAYGAAAAAAAAAAAAAAYGABIAAAAAAAAAAAYGFAAAAAAAAAAAAAYGFAAAAAAAAAABAAYGFAAAAAEAAAABAAYGAwAAAAEAAAABAAYGBgYGBgYGBgYGBgYAAAAAAABFTVBUWSAgICAgICAgICAgICAgICAgIAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4BcA8BAUUELxgfT0lPNzVCBxkPn5+fmJEOH0VNPy8vIi9HRzAPLy8hJEIPEh8pLw8HBCAGOg+fn5+TkmovDw8ACy8ABU8AD0NPCQsvHx8UGCgv8`
  `gz,H4sIAAAAAAAAE/MNiFBgZGBk4GHgZhBlYGAwZWRgYEMG7AwwwMbGQAxbCMEWYcBkM0LZjFA2MxIbCUAUu/oGhEQqYAAmBgrBA3GGDwIiAU4fG798mfK5OEShcMJPIOgUePgl5PKnT5+UvpQUMwBpIReFj4qfJn34UODEkLwApMRSbdGHDx8YNn1gCPnA8MXkw4RNHz9+dGxq+g8Az4EFGUkBAAA`
- shorter parameters
  `?use-plasma=&use-plasma-limit=20&use-plasma-time=200&use-zonkers=&use-serial-ports=#`
  becomes:
  `?2a=20x200&2b&ps#`
  `use-serial-ports` can now just be `ps`
  no `=` needed
  `use-zonkers` is now `2b`, same as zonker hex code
  now instead of 3 params for plasma we use
  `2a={plasma_limit}x{plasma_time}`
  for default values use space
  `2a=16x`
  this will use limit of `16` and default plasma time
  if both params are default then `2a=x` works, but you can then omit the value
  and just use `2a`

### Desktop

- Prevent multiple instance
  - Communication: pass opened file

## Wishes from users (unsorted)

- "Show border" option from Megaplex? (but it may cause confusion, so it must
  look different in both states).
- The possibility to select a different tile for each mouse button (for example
  empty right button and hardware left button, the middle button could perhaps
  display a floating menu with the list of all the tiles that appear in the
  position where the click is made).
- Level region clipboard persistent (t.i. store selection region in every opened
  level buffer).
  - Control Selection state with undo history. It should let selection editors
    to work more intuitive.
- Clickable "electron" icon to include/exclude n\*9 infotrons needed.
- BIN demo export/import?

### Desktop

- Dir tree
