import { FC } from "react";

export const DemoToTextHelp: FC = () => (
  <div>
    <p>
      Every keystroke from binary demo converted to text representation.
      Keystrokes can be separated with any space characters.
    </p>
    <p>
      Every keystroke has form:
      <br />
      <code>KEY</code> optionally followed by <i>duration</i>.
    </p>
    <p>
      where <code>KEY</code> can be one of the following (can be lowercase too):
    </p>
    <ul>
      <li>
        <code>-</code> &rArr; no key pressed
      </li>
      <li>
        <code>U</code> &rArr; <kbd>Up</kbd>
      </li>
      <li>
        <code>D</code> &rArr; <kbd>Down</kbd>
      </li>
      <li>
        <code>L</code> &rArr; <kbd>Left</kbd>
      </li>
      <li>
        <code>R</code> &rArr; <kbd>Right</kbd>
      </li>
      <li>
        <code>SU</code> &rArr; <kbd>Space+Up</kbd>
      </li>
      <li>
        <code>SD</code> &rArr; <kbd>Space+Down</kbd>
      </li>
      <li>
        <code>SL</code> &rArr; <kbd>Space+Left</kbd>
      </li>
      <li>
        <code>SR</code> &rArr; <kbd>Space+Right</kbd>
      </li>
      <li>
        <code>S</code> &rArr; <kbd>Space</kbd>
      </li>
    </ul>
    <p>
      The <i>duration</i> can be:
    </p>
    <ul>
      <li>
        <i>omitted</i> &rArr; 1 frame
      </li>
      <li>
        <code>
          <strong>INTEGER</strong>
        </code>{" "}
        &rArr; the given number of frames
      </li>
      <li>
        <code>
          <strong>INTEGER.</strong>
        </code>{" "}
        &rArr; the given number of "tiles", where 1 "tile" is 8 frames
      </li>
      <li>
        <code>
          <strong>INTEGER.INTEGER</strong>
        </code>{" "}
        &rArr; combination of both above, so <code>2.3</code> is 2*8+3, t.i.{" "}
        <code>19</code>
      </li>
    </ul>
    <p>Example:</p>
    <pre>-7 R42 U2.3 - L3. D5 L</pre>
    <p>This mean:</p>
    <ol>
      <li>
        nothing pressed <code>7</code> frames
      </li>
      <li>
        <kbd>Right</kbd> pressed <code>42</code> frames
      </li>
      <li>
        <kbd>Up</kbd> pressed <code>2</code> tiles and <code>3</code> frames,
        which is 2*8+3 = <code>19</code> frames
      </li>
      <li>
        nothing pressed <code>1</code> frame
      </li>
      <li>
        <kbd>Left</kbd> pressed <code>3</code> tiles, which is 3*8 ={" "}
        <code>24</code> frames
      </li>
      <li>
        <kbd>Down</kbd> pressed <code>5</code> frames
      </li>
      <li>
        <kbd>Left</kbd> pressed <code>1</code> frame
      </li>
    </ol>
  </div>
);
