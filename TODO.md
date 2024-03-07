# TODO

## Internal

- Toasts.
  - Internal editing exception from store manipulations.
- End User Manual.
  - Find or create jekyll template.
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
- Tooltips with interactive content support.
- footer info:
  - is std, why not
- new file: format description: common and per format
- tooltip for a tile/coords (in dialogs) to display part of level as context
- Import/Open level compatibility report has text from "convert file" context
- A `Dialog` don't block hotkeys behind

- `class UserError extends Error {}`, `new UserError(t => t(...))`

### Desktop

- Single instance: activate primary instance in better way.
- Windows file types association.

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
- 100% offline with level testing and demo replay?
  - Need run game engine and own offline renderer
- "replace what"
  - hex
  - "all unknown"
- Shuffle tiles in selection

### Desktop

- Dir tree
