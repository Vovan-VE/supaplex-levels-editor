# TODO

## Internal

- Toasts.
  - Level title invalid chars.
  - Some errors which now goes to `console.error()`.
  - Internal editing exception from store manipulations.
- WpColEd porting:
  - Import/export single level:
    - as standalone file;
    - with real clipboard (binary file with level or special json);
    - with internal buffer in browser storage.
  - Export/copy level body/selection as image.
  - Tiles stats.
- Compare levels.
- End User Manual.
  - Find or create jekyll template.
- Draggable files buttons to reorder many opened files.
- Electron/Wails based desktop application.
- Tools:
  - Circle
- Presets in Selection Editors
- Enhance Read Only mode more?
- Visualized level resizing with crop.
  - Separate "crop" & "extend" scenarios with Tabs, for example.

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
- Some additional (temp?) tile selection ways, like "take this specially clicked
  in body tile". Some graphical editors have something similar.
- Clickable "electron" icon to include/exclude n\*9 infotrons needed.
