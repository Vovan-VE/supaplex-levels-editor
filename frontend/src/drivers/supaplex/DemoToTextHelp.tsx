import { FC } from "react";
import { Trans } from "i18n/Trans";

export const DemoToTextHelp: FC = () => (
  <div>
    <p>
      <Trans i18nKey="main:supaplex.demoEditAsText.help.B010" />
    </p>
    <p>
      <Trans i18nKey="main:supaplex.demoEditAsText.help.B020" />
    </p>
    <p>
      <Trans i18nKey="main:supaplex.demoEditAsText.help.B030" />
    </p>
    <ul>
      <li>
        <code>-</code>
        {" ⇒ "}
        <Trans i18nKey="main:supaplex.demoEditAsText.help.NoKeyPressed" />
      </li>
      <li>
        <code>U</code> ⇒ <kbd>Up</kbd>
      </li>
      <li>
        <code>D</code> ⇒ <kbd>Down</kbd>
      </li>
      <li>
        <code>L</code> ⇒ <kbd>Left</kbd>
      </li>
      <li>
        <code>R</code> ⇒ <kbd>Right</kbd>
      </li>
      <li>
        <code>SU</code> ⇒ <kbd>Space+Up</kbd>
      </li>
      <li>
        <code>SD</code> ⇒ <kbd>Space+Down</kbd>
      </li>
      <li>
        <code>SL</code> ⇒ <kbd>Space+Left</kbd>
      </li>
      <li>
        <code>SR</code> ⇒ <kbd>Space+Right</kbd>
      </li>
      <li>
        <code>S</code> ⇒ <kbd>Space</kbd>
      </li>
    </ul>
    <p>
      <Trans i18nKey="main:supaplex.demoEditAsText.help.C010" />
    </p>
    <ul>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.D010" />
      </li>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.D020" />
      </li>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.D030" />
      </li>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.D040" />
      </li>
    </ul>
    <p>
      <Trans i18nKey="main:supaplex.demoEditAsText.help.E010" />
    </p>
    <pre>-7 R42 U2.3 - L3. D5 L</pre>
    <p>
      <Trans i18nKey="main:supaplex.demoEditAsText.help.E020" />
    </p>
    <ol>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.F010" />
      </li>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.F020" />
      </li>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.F030" />
      </li>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.F040" />
      </li>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.F050" />
      </li>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.F060" />
      </li>
      <li>
        <Trans i18nKey="main:supaplex.demoEditAsText.help.F070" />
      </li>
    </ol>
  </div>
);
