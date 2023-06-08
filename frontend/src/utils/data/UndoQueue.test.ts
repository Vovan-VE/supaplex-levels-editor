import { UndoQueue } from "./UndoQueue";

it("UndoQueue", () => {
  const a = new UndoQueue("A", 4);
  expect(a.current).toBe("A");
  expect(a.canUndo).toBe(false);
  expect(a.canRedo).toBe(false);
  {
    const b = a.done("B");
    expect(b.current).toBe("B");
    expect(b.canUndo).toBe(true);
    expect(b.canRedo).toBe(false);
    {
      const a = b.undo();
      expect(a.current).toBe("A");
      expect(a.canUndo).toBe(false);
      expect(a.canRedo).toBe(true);
    }
    {
      const c = b.done("C");
      expect(c.current).toBe("C");
      expect(c.canUndo).toBe(true);
      expect(c.canRedo).toBe(false);
      {
        const b = c.undo();
        expect(b.current).toBe("B");
        expect(b.canUndo).toBe(true);
        expect(b.canRedo).toBe(true);
        {
          const a = b.undo();
          expect(a.current).toBe("A");
          expect(a.canUndo).toBe(false);
          expect(a.canRedo).toBe(true);
          {
            const b = a.redo();
            expect(b.current).toBe("B");
            expect(b.canUndo).toBe(true);
            expect(b.canRedo).toBe(true);
            {
              const c = b.redo();
              expect(c.current).toBe("C");
              expect(c.canUndo).toBe(true);
              expect(c.canRedo).toBe(false);
            }
          }
        }
        {
          const c = b.redo();
          expect(c.current).toBe("C");
          expect(c.canUndo).toBe(true);
          expect(c.canRedo).toBe(false);
        }
        {
          const d = b.done("D");
          expect(d.current).toBe("D");
          expect(d.canUndo).toBe(true);
          expect(d.canRedo).toBe(false);
        }
      }
      {
        const f = c.done("D").done("E").done("F");
        expect(f.current).toBe("F");
        expect(f.canUndo).toBe(true);
        expect(f.canRedo).toBe(false);
        {
          const e = f.undo();
          expect(e.current).toBe("E");
          expect(e.canUndo).toBe(true);
          expect(e.canRedo).toBe(true);
          {
            const d = e.undo();
            expect(d.current).toBe("D");
            expect(d.canUndo).toBe(true);
            expect(d.canRedo).toBe(true);
            {
              const c = d.undo();
              expect(c.current).toBe("C");
              expect(c.canUndo).toBe(true);
              expect(c.canRedo).toBe(true);
              {
                const b = c.undo();
                expect(b.current).toBe("B");
                expect(b.canUndo).toBe(false);
                expect(b.canRedo).toBe(true);
              }
            }
          }
        }
      }
    }
  }
});
