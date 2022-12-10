# Changelog

## 0.6.0 (2022-12-10)

- Add: `*.sp` files support.
- Add: Convert entire file to a different format.
- Enh: Hot Key shortcuts:
  - `Ctrl+Z` Undo and `Ctrl+Y` Redo.
  - `Ctrl+X` Cut, `Ctrl+C` Copy, `Ctrl+V` Paste and `Del` Delete for Selection.
  - `Ctrl++` Zoom In, `Ctrl+-` Zoom Out.
  - `Escape` now closes a topmost dialog.
- Enh: Selection on Paste now will be placed at cell under mouse pointer first,
  or otherwise at top left corner or _visible_ area.
- Enh: Minor UI enhancements.
- Internal: Refactored Drivers, so now it's only one "Supaplex" Driver with
  different file formats.

## 0.5.0 (2022-11-09)

- Add: Selection tool with basic Cut/Copy/Paste/Delete functionality.
- Add: Button to locate primary Murphy in level.
- Enh: Optimized rendering for level tiles. Now only visible range of tiles are
  rendering. The price is some flickering while scrolling.
- Enh: Optimized editing. Now most operations with adequate level sizes runs
  enough fast.

## 0.4.1 (2022-10-24)

- Fix: Demo recording don't work due to wrong configuration.

## 0.4.0 (2022-10-24)

- Add: Experimental recording and replay embedded demo with Supaplex.Online test
  page (when supported by file format, like MPX).
- Add: Compact UI for mobile devices. Any feedback for it will be helpful.
  - UI is adaptive by default, but can be changed in new Settings dialog.
- Add: Settings dialog.
  - Coordinates display basis: 0 or 1.
- Enh: Minor UI enhancements.

## 0.3.0 (2022-10-16)

- Add: Experimental "test level" with Supaplex.Online test page.

## 0.2.0 (2022-10-15)

- Add: Flood fill drawing tool.
- Add: Rectangle drawing tools.
- Add: Display hovered cell coordinates in footer.
- Add: Open first level when a file opened or created.
- Fix: Improved stability for flushing changes back to in-memory file.
  - Fix: The latest changes in levels may be lost sometimes due to bug in logic.
  - Fix: Flush was firing on first "page hide" event only.
  - Enh: Reduced delay to flush changes in background from 3 to 0.3 sec.
- Fix: Incorrect border in new MPX file with custom size.
- Fix: Lost which levels was previously opened on page load.
- Fix: Dragging pointer out of canvas while drawing cause drawing to stop and
  breaks next one drawing.
- Fix: Some text grammar.

## 0.1.0 (2022-10-13)

- MVP is reached. First public release.