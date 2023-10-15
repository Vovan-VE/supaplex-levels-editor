// -- High nibble: Time-unit repeat count minus 1 for low nibble command key.
//    This is the information from which the total demo duration
//    is calculated, corrected with the (stored) SpeedFix setting.
//    At normalized speed, these time units are 1/35th of a second
//    each. Example: If this nibble shows 9, it means 9+1=10
//    time units for the command key in the lower nibble.
// -- Low nibble:
//    Command key, equivalent with the keyboard game keys:
//      0 = just wait: no key pressed
//      1 = cursor up
//      2 = cursor left
//      3 = cursor down
//      4 = cursor right
//      5 = space + cursor up
//      6 = space + cursor left
//      7 = space + cursor down
//      8 = space + cursor right
//      9 = space only
//      A = (not used)
//      B = (not used)
//      C = (not used)
//      D = (not used)
//      E = (not used)
//      F = (not used! / low nibble of the end-of-demo byte)
// - hex FFh byte, meaning: end of demo.
//
// The maximum demo file length is 1+64008+1=64010 bytes, which is an arbitrary
// amount set by Robin Heydon (which could have been 65514 bytes maximum only).
//
// This maximum total demo length of 64010 bytes has been reduced in the SpeedFix
// versions 5 and up to 48650 bytes because the same space is needed for all 10
// demo levels of 1536 bytes each. (48650+10*1536=64010) See also just below.

const KEY_STR = ["-", "U", "L", "D", "R", "SU", "SL", "SD", "SR", "S"];
const CH_TILES = ".";
const FRAMES_PER_TILE = 8;

export interface ToTextOptions {
  wrapWidth?: number;
  useTilesTime?: boolean;
}

export const demoToText = (
  demo: Uint8Array | null,
  { wrapWidth = Infinity, useTilesTime = false }: ToTextOptions = {},
): string => {
  if (!demo) {
    return "";
  }
  let text = "";
  let lastKey = 0;
  let duration = 0;
  let lineLen = 0;
  function flush() {
    if (!duration) {
      return;
    }
    if (lastKey < KEY_STR.length) {
      let add = KEY_STR[lastKey];

      if (duration > 1) {
        if (useTilesTime) {
          const tiles = Math.floor(duration / FRAMES_PER_TILE);
          const rest = duration % FRAMES_PER_TILE;
          if (tiles > 0) {
            add += tiles + CH_TILES;
          }
          if (rest > 0) {
            add += rest;
          }
        } else {
          add += duration;
        }
      }

      if (lineLen > 0) {
        if (lineLen + 1 + add.length > wrapWidth) {
          text += "\n";
          lineLen = 0;
        } else {
          text += " ";
          lineLen++;
        }
      }

      text += add;
      lineLen += add.length;
    }
    duration = 0;
  }
  for (const hh of demo) {
    const time = ((hh >> 4) & 0xf) + 1;
    const key = hh & 0xf;
    if (key !== lastKey) {
      flush();
      lastKey = key;
    }
    duration += time;
  }
  flush();

  return text;
};

export const demoFromText = (text: string) => {
  const demo: number[] = [];
  function flush(key: number, duration: number) {
    const fulls = Math.floor(duration / 16);
    const rest = duration % 16;
    if (fulls > 0) {
      const hh = 0xf0 | key;
      for (let i = fulls; i-- > 0; ) {
        demo.push(hh);
      }
    }
    if (rest > 0) {
      demo.push(((rest - 1) << 4) | key);
    }
  }

  const L = text.length;
  let at = 0;
  function parseInt() {
    let to = at;
    let ch: string;
    while ((ch = text.charAt(to)) >= "0" && ch <= "9") {
      to++;
    }
    if (to > at) {
      return { int: Number(text.substring(at, to)), next: to };
    }
    return null;
  }
  while (at < L) {
    let ch = text.charAt(at);
    if (/\s/u.test(ch)) {
      at++;
      continue;
    }
    ch = ch.toUpperCase();

    let to = at;
    if (ch === "-") {
      to++;
    } else {
      if (ch === "S") {
        to++;
        ch = text.charAt(to).toUpperCase();
      }
      switch (ch) {
        case "U":
        case "L":
        case "D":
        case "R":
          to++;
      }
    }
    if (to === at) {
      throw new SyntaxError(
        `Unexpected char ${JSON.stringify(text.charAt(at))} at offset ${at}`,
      );
    }
    const keyStr = text.substring(at, to).toUpperCase();
    const keyCode = KEY_STR.indexOf(keyStr);
    if (keyCode < 0) {
      throw new Error(`bad parse state: keyStr=${JSON.stringify(keyStr)}`);
    }
    at = to;

    const wasAt = at;
    let frames = 0;
    const int1 = parseInt();
    if (int1) {
      at = int1.next;
      if (text.charAt(at) === CH_TILES) {
        at++;
        frames = int1.int * FRAMES_PER_TILE;

        const int2 = parseInt();
        if (int2) {
          at = int2.next;
          frames += int2.int;
        }
      } else {
        frames = int1.int;
      }
    } else {
      frames = 1;
    }

    if (!frames) {
      throw new SyntaxError(`Invalid zero duration at offset ${wasAt}`);
    }

    flush(keyCode, frames);
  }

  if (demo.length <= 0) {
    return null;
  }
  return new Uint8Array(demo);
};
