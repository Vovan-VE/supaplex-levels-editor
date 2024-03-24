import { useUnit } from "effector-react";
import { FC, PropsWithChildren, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MurphyRuns from "assets/img/murphy-run-right.svg?react";
import { setClipboardText, testInIframe } from "backend";
import { TEST_DEMO_URL, TEST_LEVEL_TITLE, TEST_LEVEL_URL } from "configs";
import {
  getDriver,
  IBaseLevel,
  LevelEditProps,
  levelSupportsDemo,
} from "drivers";
import DiskYellow from "drivers/supaplex/tiles-svg/18-12-yellow-disk.svg?react";
import HwLampGreen from "drivers/supaplex/tiles-svg/29-1d-hw-g-lamp.svg?react";
import { Trans } from "i18n/Trans";
import { exportLevelAsLink } from "models/levels/export-url";
import {
  $currentDriverName,
  $currentFileRo,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";
import { $fileSupportsDemo, rememberDemoTarget } from "models/levelsets/demo";
import { showToast } from "models/ui/toasts";
import { Button, TextButton } from "ui/button";
import { ask, msgBox } from "ui/feedback";
import { IconStack, IconStackType, svgs } from "ui/icon";
import { ColorType } from "ui/types";
import { openSignatureEdit } from "./openSignatureEdit";
import cl from "./TestingButtons.module.scss";

const CL_SVG_ANIMATE_HOVERABLE = "svg-animate_hover-target";
const TEST_WITH_DEMO_STACK: IconStack = [[IconStackType.Index, <DiskYellow />]];
const PLAY_DEMO_STACK: IconStack = [[IconStackType.Index, <HwLampGreen />]];
const SIGNATURE_STACK: IconStack = [[IconStackType.Index, <svgs.Pencil />]];

const VALUES = { SO: TEST_LEVEL_TITLE };

export const TestingButtons: FC = () => {
  const { t } = useTranslation();
  const undoQueue = useUnit($currentLevelUndoQueue)!;
  const demoSupport = useUnit($fileSupportsDemo);

  const level = undoQueue.current;
  const hasDemo =
    demoSupport && levelSupportsDemo(level) && level.demo !== null;
  // const signatureSupport = demoSupport && levelSupportSignature(level);

  const handleTest = useCallback(
    () => sendToTest(level, demoSupport),
    [level, demoSupport],
  );
  const handleDemo = useMemo(
    () => (demoSupport ? () => sendToDemo(level) : undefined),
    [level, demoSupport],
  );

  return (
    <>
      <TextButton
        onClick={handleTest}
        icon={<MurphyRuns />}
        iconStack={demoSupport ? TEST_WITH_DEMO_STACK : undefined}
        className={CL_SVG_ANIMATE_HOVERABLE}
        title={
          demoSupport
            ? t("main:levelTest.buttons.TestLevelRecordDemo", VALUES)
            : t("main:levelTest.buttons.TestLevel", VALUES)
        }
      />
      {demoSupport && (
        <>
          <TextButton
            onClick={handleDemo}
            icon={<MurphyRuns />}
            iconStack={PLAY_DEMO_STACK}
            className={CL_SVG_ANIMATE_HOVERABLE}
            title={t("main:levelTest.buttons.DemoPlayback", VALUES)}
            disabled={!hasDemo}
          />
          <Button
            onClick={openSignatureEdit}
            icon={<svgs.FileBlank />}
            iconStack={SIGNATURE_STACK}
            title={t("main:edit.EditDemoAndSignature")}
            // disabled={!signatureSupport}
          />
        </>
      )}
    </>
  );
};

const TestFrame: FC<{ url: URL }> = ({ url }) => {
  // // Cross-Origin `iframe` must be clicked/focused manually by user to get
  // // permissions for sounds, and to let game playable with keyboard.
  // // So, here I create a link in empty same-origin iframe to force user to click
  // // the link first. This puts focus to `iframe` before navigating to cross-origin.
  // const ref = useRef<HTMLIFrameElement | null>(null);
  // useEffect(() => {
  //   const f = ref.current;
  //   if (f) {
  //     const d = f.contentDocument!;
  //     const ds = d.body.style;
  //     ds.backgroundColor = "#000";
  //     ds.color = "#ddd";
  //     ds.padding = "1rem";
  //     ds.display = "flex";
  //     ds.alignItems = "center";
  //     ds.justifyContent = "center";
  //     const a = d.body.appendChild(d.createElement("a"));
  //     a.setAttribute("href", url.toString());
  //     a.appendChild(d.createTextNode("Click to load testing page"));
  //     const as = a.style;
  //     as.color = "inherit";
  //     as.fontSize = "1.5rem";
  //   }
  // }, [url]);

  return (
    <iframe
      src={url.toString()}
      // key={url.toString()}
      // ref={ref}
      title="Testing Level"
      className={cl.soArea}
      // allow={`autoplay 'self' ${url.origin}; fullscreen 'self' ${url.origin}`}
      allow="autoplay *; fullscreen *"
    />
  );
};

const openTestUrl = testInIframe
  ? (url: URL): boolean => {
      ask(<TestFrame url={url} />, {
        size: "fullscreen",
        buttons: {
          okText: <Trans i18nKey="desktop:levelTest.buttons.ClickInIframe" />,
          ok: { disabled: true, uiColor: ColorType.MUTE },
          cancelText: <Trans i18nKey="main:common.buttons.Close" />,
          cancel: { uiColor: ColorType.WARN },
        },
        bodyClassName: cl.soDialogBody,
      });
      return true;
    }
  : (url: URL, target: string): boolean => {
      return Boolean(window.open(url, target));
    };

type ConfirmFC = FC<PropsWithChildren<LevelEditProps<IBaseLevel>>>;

const sendLevelTo = async ({
  level,
  baseUrl,
  target,
  withDemo = false,
  // actionTitle,
  // $confirmed,
  Confirm,
  onConfirmed,
}: {
  level: IBaseLevel;
  baseUrl: string;
  target?: string;
  withDemo?: boolean;
  // actionTitle: string;
  // $confirmed: Store<boolean>;
  Confirm: ConfirmFC;
  onConfirmed?: () => void;
}) => {
  const [valid, errors] = level.isPlayable();
  if (!valid) {
    return msgBox(
      <div>
        <p>
          <Trans i18nKey="main:levelTest.LevelUnplayableDueTo" />
        </p>
        <ul>
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </div>,
    );
  }

  const targetOrBlank = target ?? "_blank";

  // if ($confirmed.getState()) {
  //   onConfirmed?.();
  //   if (!window.open(url, targetOrBlank)) {
  //     msgBox(
  //       <div>
  //         <p>Could not open new window. Follow the link:</p>
  //         <p>
  //           {/* eslint-disable-next-line react/jsx-no-target-blank */}
  //           <a href={url} target={targetOrBlank} rel={rel}>
  //             {actionTitle} at {serviceTitle}
  //           </a>
  //         </p>
  //       </div>,
  //       { button: { text: "Close" } },
  //     );
  //   }
  //   return;
  // }

  // REFACT: adequate components with state

  await ask(
    <Confirm
      level={level}
      onChange={$currentFileRo.getState() ? undefined : (l) => (level = l)}
    />,
    {
      buttons: {
        okText: (
          <Trans i18nKey="main:levelTest.buttons.GoToSO" values={VALUES} />
        ),
        ok: {
          uiColor: ColorType.SUCCESS,
          onClick: async () => {
            if (!$currentFileRo.getState()) {
              updateCurrentLevel(level);
            }
            onConfirmed?.();

            const url = await exportLevelAsLink(level, baseUrl, withDemo);
            const driverName = $currentDriverName.getState()!;
            const { applyLocalOptions } = getDriver(driverName)!;
            applyLocalOptions?.(level, url);

            if (openTestUrl(url, targetOrBlank)) {
              // e.preventDefault();
            }
          },
        },
      },
    },
  );
};

const ConfirmSO: FC<
  PropsWithChildren<
    { toDoWhat: string; showOptions?: boolean } & Partial<
      LevelEditProps<IBaseLevel>
    >
  >
> = ({ toDoWhat, showOptions, level, onChange, children }) => {
  const { t } = useTranslation();
  // const confirmed = useUnit($prefConfirmedTestSO);

  const { LevelLocalOptions, applyLocalOptions } = getDriver(
    useUnit($currentDriverName)!,
  )!;

  const optionsAsCode = useMemo(() => {
    if (level && applyLocalOptions) {
      const url = new URL(window.location.origin);
      applyLocalOptions(level, url);
      const params = Array.from(url.searchParams.entries());
      if (params.length) {
        return (
          "```\n" +
          params.map(([k, v]) => `${k}${v ? `=${v}` : ""}`).join("\n") +
          "\n```"
        );
      }
    }
    return "";
  }, [level, applyLocalOptions]);

  const handleCopy = useCallback(async () => {
    if (optionsAsCode) {
      try {
        await setClipboardText(optionsAsCode);
        showToast({
          message: t("main:common.toasts.Copied"),
          color: ColorType.SUCCESS,
        });
      } catch (e) {
        await msgBox(
          <>
            <p>{t("main:levelTest.CannotCopyHereCode")}</p>
            <pre>
              <code>{optionsAsCode}</code>
            </pre>
          </>,
          { size: "small" },
        );
      }
    }
  }, [t, optionsAsCode]);

  return (
    <div className={cl.confirmSO}>
      <p>
        <Trans
          i18nKey="main:levelTest.ToDoWhateverItWillBeSent"
          values={{ ...VALUES, toDoWhat }}
        />
      </p>
      {children}
      {/*<div>*/}
      {/*  <Checkbox checked={confirmed} onChange={setPrefAskTestSO}>*/}
      {/*    Don't show this confirmation again*/}
      {/*  </Checkbox>*/}
      {/*</div>*/}
      {level && showOptions && LevelLocalOptions && (
        <div className={cl.options}>
          <div>
            <LevelLocalOptions level={level} onChange={onChange} />
          </div>
          <Button
            icon={<svgs.Copy />}
            onClick={handleCopy}
            title={t("main:levelTest.CopyOptionsAsCode") + "\n" + optionsAsCode}
            disabled={!optionsAsCode}
          />
        </div>
      )}
    </div>
  );
};

const ConfirmTestSO: ConfirmFC = ({ level, onChange }) => {
  const { t } = useTranslation();
  const demoSupport = useUnit($fileSupportsDemo);

  // REFACT: remove this when resolved outside
  const [_level, _setLevel] = useState(level);
  const handleLevelChange = useMemo(
    () =>
      onChange &&
      ((level: IBaseLevel) => {
        _setLevel(level);
        onChange(level);
      }),
    [onChange],
  );

  return (
    <ConfirmSO
      toDoWhat={t("main:levelTest.ToTestLevel")}
      showOptions
      level={_level}
      onChange={handleLevelChange}
    >
      {demoSupport ? (
        <p>
          <Trans i18nKey="main:levelTest.NoticeToSaveDemo" />
        </p>
      ) : (
        <p>
          <Trans i18nKey="main:levelTest.NoticeNoDemoSupport" />
        </p>
      )}
    </ConfirmSO>
  );
};

const sendToTest = (level: IBaseLevel, demoSupport: boolean) =>
  sendLevelTo({
    level,
    baseUrl: TEST_LEVEL_URL,
    target: demoSupport ? "test-level" : undefined,
    // actionTitle: "Test level",
    // $confirmed: $prefConfirmedTestSO,
    Confirm: ConfirmTestSO,
    onConfirmed: demoSupport ? rememberDemoTarget : undefined,
  });

const ConfirmPlayDemoSO: FC = () => {
  const { t } = useTranslation();
  return <ConfirmSO toDoWhat={t("main:levelTest.ToReplayDemo")} />;
};

const sendToDemo = (level: IBaseLevel) =>
  sendLevelTo({
    level,
    baseUrl: TEST_DEMO_URL,
    withDemo: true,
    // actionTitle: "Play demo",
    // $confirmed: $prefConfirmedTestSO,
    Confirm: ConfirmPlayDemoSO,
  });
