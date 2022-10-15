# Changelog

## 0.2.0 (DEV)

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
