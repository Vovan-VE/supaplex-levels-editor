# Changelog

## 0.21.0 (DEV)

- Add: Export current level as ZIP With Options.
- Add: Seed in Demo Edit dialog.
- Add: Transpose selection editor.
- Add: `Ctrl+A` hotkey to select whole level body and `Ctrl+Shift+A` to select
  almost whole without border. 
- Fix: Hovered cell display didn't use Selection own Content.
- Enh: Use level title in filename when exporting a level.

### Desktop

- On Linux now `libwebkit` 4.1 is required (`libwebkit2gtk-4.1-0`).
- Fix: Several issues potentially causing losing config and/or opened
  files/levels state due to bad and/or unstable concurrent I/O.

## 0.20.0 (2024-03-24)

- Add: Display demo duration in Demo/Signature edit dialog.
- Add: Replace selection editor can replace raw HEX and all unknown tiles.
- Add: Shuffle selection editor.
- Add: Experimental support for multiple languages. Russian language added.
- Fix: FireFox cannot read text from clipboard (open/import test url).
- Fix: Open/import level by test/demo url loss local options.
- Fix: Export test/demo url could miss `pd=` (spec ports db) param, when spec
  ports db itself is std compatible without notice, that some port actually is
  not special port tile.

### Desktop

- Fix: Copy to clipboard didn't work (level options, export as link).

## 0.19.0 (2024-03-03)

- Add: Spec Ports DB dialog now allows to edit entire DB as text.
- Add: Read Only mode can be toggled in a file. See new button near "Rename".
- Add: Display Hex and Char values for hovered tile.
- Add: Reordering levels in file. See "Levels order" in levels buttons.
- Add: Display selection state in footer.
- Add: A test/demo link presented in clipboard can be opened as a new file, or
  can be imported into current level.
- Fix: Some UI texts correction in progress. Thanks to Lana Snik-Snak!
- Fix: H/V/X Ports when set as Special wasn't marked Special in "Copy as Image".
- Fix: Copy/Export Level/Selection icons and compact layout.
- Fix: Copy level as test/demo link missed custom Options.
- Enh: H/V/X Ports in Toolbar are halved too.
- Enh: Spec Ports DB dialog UX:
  - display the tile in the giver cell;
  - limit dialog height and add scroll to the list.
- Enh: Random selection editor now uses integer input fields for better
  probabilities setup.
- Enh: Replace selection editor now allows multiple "what" to replace.
- Enh: Random selection editor now has optional "Replace what" to affect only
  specified tiles in a selection.

### Desktop

- Enh: A page in WebView now loads faster since Wails upgraded to >=2.7.

## 0.18.0 (2023-12-01)

- Add: New SO Special Ports Database support. This brings the following changes:
  - More than 10 special ports can be defined in a level.
  - No limit for special port position in big MPX level.
  - Any Port can now be defined as Special.
  - Any of environment features controlling by a Special Port can be set to
    "don't change" and "toggle" in Special Port properties.
- Add: Editing the unused byte in every Special Port Database Entry. Can be used
  for customizing the bottom beyond for SP compatible entries.
- Add: "Initial Freeze Enemies" game condition. All three conditions are now
  compacted into a single dropdown button "Initial conditions".
- Add: Special Ports Database now can be sorted manually. See new "Initial
  conditions" button.
- Fix: "Broken" Special Ports (which are Special Port tiles, but without entry
  in Special Ports Database) in Selection region wasn't render same as in level
  body.
- Fix: Initial gravity uses `0` to "OFF" and other values to "ON", as it
  actually works in game, which isn't match with docs.
- Enh: Better colors for special ports.

## 0.17.0 (2023-10-15)

- Add: Textual editing for demo keystrokes.
- Fix: SP file format loss demo signature on file read.

### Desktop

- Add: Prevent multiple instances to ran in the same time.
- Add: "Open file with" like whatever editors do.
- Fix: Same file now cannot be opened multiple times in same instance.
- Fix: Debug app didn't write logs.
- Fix: Files, opened in previous run, if missing on startup didn't prune from
  internal storage, causing the last to grow and keep trying to open the files
  on every program run.
- Fix: Invisible app window on start if app was exited being minimized (Win10).

## 0.16.1 (2023-09-18)

### Desktop

- Fix: Test SO iframe collapsed to small size.

## 0.16.0 (2023-09-15)

- Add: Compare levels tool.

### Desktop

- Add: Installer for Windows, DEB package for Debian. Standalone portable binary
  is packed to zip.
- Fix: Windows: Stable path for WebView data.

## 0.15.0 (2023-07-22)

- Add: Option to SO Test Page to override number of infotrons needed.
- Fix: Produced MPX files now should work better in Megaplex. Dropped support of
  incorrect MPX header (with spaces) when saving MPX file with 1 level.
- Enh: Short options to SO Test Page

### Desktop

- Add: Logging errors to a log file for debug purpose to simplify feedback.
- Add: Display app directories in "Info" dialog.

## 0.14.0 (2023-06-23)

- Add: Demo Signature editing.
- Add: Hotkey Shortcuts for Drawing Tools:
  - `1` - Pencil;
  - `2` - Pencil 1x2 and 2x1 (cycled);
  - `3` - Pencil 3x3;
  - `F` - Flood Fill;
  - `L` - Straight Line;
  - `R` - Frame and Filled Rect (cycled);
  - `S` - Selection.
- Add: Files buttons can be reordered by drag-n-drop.
- Add: Export current level body (or selection) as PNG image to a file or to
  clipboard.
- Add: Export current level as Test or Demo Link to SO test page.

### sple.me

- Fix: Wrong text in "close file" prompt.

### Desktop

- Add: Checking if new release available.
- Fix: Navigating to external link not worked as expected.
- Fix: Windows: "New file" displays full file path in UI.

## 0.13.2 (2023-06-12)

### sple.me

- Fix: Demo recording/playback accidentally was switched to `iframe` mode as in
  desktop build. Now it's restored as it was before.

### Desktop

- Add: Remember window position and size.
- Fix: "New file" could display outdated file name if renamed in "Save" dialog.

## 0.13.1 (2023-06-11)

### Desktop

- Fix: "Open file" was broken, causing unexpected "Save file" dialog to appear.
- Fix: Refused to reopen previously opened files if one of them errored.

## 0.13.0 (2023-06-11)

This version has no significant feature changes in <https://sple.me>. This
release brings experimental Desktop SpLE app.

Desktop version of **SpLE** built using [Wails](https://wails.io). It uses the
same source code as web app <https://sple.me> to render frontend, but with some
different backend bindings to work with its host binary in desktop environment.
It doesn't need internet connection, and it works with regular files on your
device.

### Common changed

- Fix: Broken link in "Info" dialog.

### sple.me

- No new features.

### Desktop

- First release.
  - There are some changes in how new/open/save works to fit desktop
    environment.
  - Auto save feature is OFF by default and can be turned ON in Settings with
    wanted timeout. Web sple.me have no this option because it's always ON with
    minimal timeout to prevent data loss.
  - Level testing and demo replay are run in `iframe` due to technical
    limitations. This cause a minor issue: you must click inside `iframe` after
    it opens to start hear its sounds and interact with it.

## 0.12.0 (2023-05-20)

- Add: Export/Import current level to/from standalone file (SP/MPX).
- Add: UI Toasts for some missing feedback messages.
- Add: Pick Tile from current level body by `Ctrl+Click`.
- Fix: A `*.sp` file without a demo was opening as DAT format, and so new demo
  could not be created. Now it opens correctly.
  - To fix in-memory SP file already opened earlier, you can use
    "Convert format" feature to manually convert to "SP" format. You will see
    only one "Test level" button in such incorrectly opened files (instead of
    two: "Test level" and "Play embedded demo").

## 0.11.0 (2023-04-20)

- Add: "Straight line" drawing tool.
- Add: Keyboard shortcuts to Selection Editors from previous release.
- Add: Button to delete all the rest levels to the end of file.
- Add: Tiles stats used in level.
- Enh: Replace number inputs and selects in Maze and Random tools with sliders.
- Enh: Selection Editors now remember theirs values.
- Fix: Selection Editors was inaccessible in compact layout (small screen).

## 0.10.0 (2023-04-16)

- Add: Pen tool with shapes 1x2 and 2x1 with Double Chips support. This will be
  enhanced in further versions.
- Add: Selection edit tools. Select a region of level body, and the new dropdown
  button will allow to apply to the selection the following tools:
  - Chess;
  - Gradient;
  - Maze;
  - Replace;
  - Random;
  - Flip.
- Add: Display primitive notice when "Infotrons needed" = 0 (all), and level has
  more than 255 infotrons.
- Enh: Special Ports buttons in tiles toolbar was merged with corresponding
  Regular Ports. So now there are 4 fewer buttons.
  - To switch Regular/Special port, Right-Click on the port in level body.
  - Special port properties are tended to keep when changing special port by
    another one with different direction, as when previously you directly
    replace one Special Port with another.
  - When Special Port has no properties in level (and so will behave as Regular
    Port while technically it's Special Port), it will look half-colored in
    level body as in Tile Toolbar.
- Enh: Toolbars layout now is more adaptive to be more compact together.

## 0.9.0 (2023-03-25)

- Add: options for SO test page:
  - Plasma limit and Plasma time;
  - Use Serial ports.
- Add: Button to copy SO level options to clipboard to use in level upload
  requests.
- Add: "Save with options" button to download levelset as `*.zip`.
- Add: "Remove Other files" button.
- Add: "Close Other levels" button.
- Enh: Reduce paddings in several UI components to compress whole UI.
- Enh: Hide "Append level" button in dropdown as if it's rate used feature.
- Enh: Hide "Insert/Append/Remove" buttons in SP format, since it's useless.
- Enh: `Escape` now closes dropdown popup.

## 0.8.0 (2023-01-30)

- Add: experimental options to use Plasma and/or Zonkers on SO test page.
  - Options live in editor only, because there are no new file format for that
    yet.
  - While options are prompted right before sending to test page, "ask
    confirmation" option was temporarily removed from Settings.

## 0.7.0 (2022-12-15)

- Add: Indicator to show pending data flushes into browser storage. It will
  become visible when a flush will take more time than usual, mostly when
  editing large file.
- Add: Options in "New File" and "Resize" dialogs to select border and fill
  tiles.
- Add: Option in Settings to switch Double Chips graphics.
- Enh: Reorder tiles in toolbar by at least some logic for better UX.
- Fix: Multiple parallel instances of SpLE in a browser session may cause data
  loss. Now it is prevented by introducing Read Only mode.
- Fix: Data just read from browser storage was flushed back unnecessary on every
  page load.
- Fix: Writing to browser storage only edited file. Before this all opened files
  was unnecessarily rewritten on every change in any file.
- Fix: "Append level" did not switch to newly created level.

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
