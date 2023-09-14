import { DataRect } from "../dataRect";

export const mkData = (...lines: string[]) => {
  const rows = lines;
  const cols = rows.reduce((n, s) => Math.max(n, s.length), 0);
  const data = new DataRect(cols, rows.length);
  for (const [y, row] of rows.entries()) {
    for (const [x, s] of [...row].entries()) {
      const n = s.charCodeAt(0);
      data.setTile(x, y, n === 32 ? 0 : n);
    }
  }
  return data;
};

export const dumpData = (data: DataRect): string[] => {
  const lines: string[] = [];
  const { width, height } = data;
  for (let y = 0; y < height; y++) {
    let s = "";
    for (let x = 0; x < width; x++) {
      const n = data.getTile(x, y);
      s += n === 0 ? " " : String.fromCharCode(n);
    }
    lines.push(s);
  }
  return lines;
};
