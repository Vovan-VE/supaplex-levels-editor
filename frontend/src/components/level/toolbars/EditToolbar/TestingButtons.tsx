import { useStore } from "effector-react";
import {
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { ReactComponent as MurphyRuns } from "assets/img/murphy-run-right.svg";
import { testInIframe } from "backend";
import { TEST_DEMO_URL, TEST_LEVEL_TITLE, TEST_LEVEL_URL } from "configs";
import {
  getDriver,
  getDriverFormat,
  IBaseLevel,
  LevelConfiguratorProps,
  levelSupportsDemo,
  levelSupportSignature,
} from "drivers";
import { ReactComponent as DiskYellow } from "drivers/supaplex/tiles-svg/12-yellow-disk.svg";
import { ReactComponent as HwLampGreen } from "drivers/supaplex/tiles-svg/1d-hw-g-lamp.svg";
import {
  $currentDriverFormat,
  $currentDriverName,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";
import { $fileSupportsDemo, rememberDemoTarget } from "models/levelsets/demo";
import { showToast } from "models/ui/toasts";
import { Button, TextButton } from "ui/button";
import { ask, msgBox } from "ui/feedback";
import { IconStack, IconStackType, svgs } from "ui/icon";
import { ColorType } from "ui/types";
import { base64Encode } from "utils/encoding/base64";
import { tryGzipCompress } from "utils/encoding/gzip";
import { openSignatureEdit } from "./SignatureEdit";
import cl from "./TestingButtons.module.scss";

const CL_SVG_ANIMATE_HOVERABLE = "svg-animate_hover-target";
const TEST_WITH_DEMO_STACK: IconStack = [[IconStackType.Index, <DiskYellow />]];
const PLAY_DEMO_STACK: IconStack = [[IconStackType.Index, <HwLampGreen />]];
const SIGNATURE_STACK: IconStack = [[IconStackType.Index, <svgs.Pencil />]];

export const TestingButtons: FC = () => {
  const undoQueue = useStore($currentLevelUndoQueue)!;
  const demoSupport = useStore($fileSupportsDemo);

  const rawLevel = undoQueue.current;
  const hasDemo =
    demoSupport && levelSupportsDemo(rawLevel) && rawLevel.demo !== null;
  const signatureSupport = demoSupport && levelSupportSignature(rawLevel);

  return (
    <>
      <TextButton
        onClick={handleTestClick}
        icon={<MurphyRuns />}
        iconStack={demoSupport ? TEST_WITH_DEMO_STACK : undefined}
        className={CL_SVG_ANIMATE_HOVERABLE}
        title={`Test level at ${TEST_LEVEL_TITLE}${
          demoSupport ? " (+record a demo)" : ""
        }`}
      />
      {demoSupport && (
        <>
          <TextButton
            onClick={handleDemoClick}
            icon={<MurphyRuns />}
            iconStack={PLAY_DEMO_STACK}
            className={CL_SVG_ANIMATE_HOVERABLE}
            title={`Play embedded demo with ${TEST_LEVEL_TITLE}`}
            disabled={!hasDemo}
          />
          <Button
            onClick={openSignatureEdit}
            icon={<svgs.FileBlank />}
            iconStack={SIGNATURE_STACK}
            title="Edit demo signature"
            disabled={!signatureSupport}
          />
        </>
      )}
    </>
  );
};

const packLevelToSend = async (baseUrl: string, withDemo: boolean) => {
  const driverName = $currentDriverName.getState()!;
  const { writeLevelset, createLevelset } = getDriverFormat(
    driverName,
    $currentDriverFormat.getState()!,
  )!;
  let level = $currentLevelUndoQueue.getState()!.current;
  const [valid, errors] = level.isPlayable();
  if (!valid) {
    msgBox(
      <div>
        <p>The level is unplayable due to the following:</p>
        <ul>
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </div>,
    );
    return;
  }
  if (!withDemo && levelSupportsDemo(level)) {
    level = level.setDemo(null);
  }

  const url = new URL(baseUrl);
  const raw = writeLevelset(createLevelset([level]));
  const compressed = await tryGzipCompress(raw);
  url.hash = compressed ? "gz," + base64Encode(compressed) : base64Encode(raw);
  return url;
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
      allow={`autoplay 'self' ${url.origin}; fullscreen 'self' ${url.origin}`}
    />
  );
};

const openTestUrl = testInIframe
  ? (url: URL): boolean => {
      ask(<TestFrame url={url} />, {
        size: "fullscreen",
        buttons: {
          okText: (
            <>
              Click inside <code>iframe</code> to activate
            </>
          ),
          ok: { disabled: true, uiColor: ColorType.MUTE },
          cancelText: "Close",
          cancel: { uiColor: ColorType.WARN },
        },
      });
      return true;
    }
  : (url: URL, target: string): boolean => {
      return Boolean(window.open(url, target));
    };

type ConfirmFC = FC<PropsWithChildren<LevelConfiguratorProps<IBaseLevel>>>;

const sendLevelTo = async ({
  baseUrl,
  target,
  withDemo = false,
  // actionTitle,
  serviceTitle,
  // $confirmed,
  Confirm,
  onConfirmed,
}: {
  baseUrl: string;
  target?: string;
  withDemo?: boolean;
  // actionTitle: string;
  serviceTitle: string;
  // $confirmed: Store<boolean>;
  Confirm: ConfirmFC;
  onConfirmed?: () => void;
}) => {
  const url = await packLevelToSend(baseUrl, withDemo);
  if (!url) {
    return;
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
  let level = $currentLevelUndoQueue.getState()!.current;

  await ask(<Confirm level={level} onChange={(l) => (level = l)} />, {
    buttons: {
      okText: `Go to ${serviceTitle} test`,
      ok: {
        uiColor: ColorType.SUCCESS,
        onClick: (e) => {
          updateCurrentLevel(level);
          onConfirmed?.();

          const driverName = $currentDriverName.getState()!;
          const { applyLocalOptions } = getDriver(driverName)!;
          applyLocalOptions?.(level, url);

          if (openTestUrl(url, targetOrBlank)) {
            e.preventDefault();
          }
        },
      },
    },
  });
};

const ConfirmSO: FC<
  PropsWithChildren<
    { toDoWhat: ReactNode } & Partial<LevelConfiguratorProps<IBaseLevel>>
  >
> = ({ toDoWhat, level, onChange, children }) => {
  // const confirmed = useStore($prefConfirmedTestSO);

  const { LevelLocalOptions, applyLocalOptions } = getDriver(
    useStore($currentDriverName)!,
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
        await window.navigator.clipboard.writeText(optionsAsCode);
        showToast({
          message: "Copied",
          color: ColorType.SUCCESS,
        });
      } catch (e) {
        await msgBox(
          <>
            <p>Could not copy. Here is the code:</p>
            <pre>
              <code>{optionsAsCode}</code>
            </pre>
          </>,
          { size: "small" },
        );
      }
    }
  }, [optionsAsCode]);

  return (
    <div className={cl.confirmSO}>
      <p>
        {toDoWhat}, it <strong>will be sent to</strong>{" "}
        <a href={TEST_LEVEL_URL} target="_blank" rel="noopener noreferrer">
          {TEST_LEVEL_TITLE} test page
        </a>
        . It will be opened in new tab/window, so you will not loss undo history
        in current editing session.
      </p>
      {children}
      {/*<div>*/}
      {/*  <Checkbox checked={confirmed} onChange={setPrefAskTestSO}>*/}
      {/*    Don't show this confirmation again*/}
      {/*  </Checkbox>*/}
      {/*</div>*/}
      {level && onChange && LevelLocalOptions && (
        <div className={cl.options}>
          <div>
            <LevelLocalOptions level={level} onChange={onChange} />
          </div>
          <Button
            icon={<svgs.Copy />}
            onClick={handleCopy}
            title={`Copy code to clipboard to use in level upload request:\n\n${optionsAsCode}`}
            disabled={!optionsAsCode}
          />
        </div>
      )}
    </div>
  );
};

const ConfirmTestSO: ConfirmFC = ({ level, onChange }) => {
  const demoSupport = useStore($fileSupportsDemo);

  // REFACT: remove this when resolved outside
  const [_level, _setLevel] = useState(level);
  const handleLevelChange = useCallback(
    (level: IBaseLevel) => {
      _setLevel(level);
      onChange(level);
    },
    [onChange],
  );

  return (
    <ConfirmSO
      toDoWhat="To test a level"
      level={_level}
      onChange={handleLevelChange}
    >
      {demoSupport ? (
        <p>
          In order <strong>to save demo</strong> for this level, please{" "}
          <strong>don't test another</strong> level until you finish with this
          one. You will be asked to save new demo.
        </p>
      ) : (
        <p>
          This file format does not support embedded demos, so a created demo
          will be silently discarded.
        </p>
      )}
    </ConfirmSO>
  );
};

const handleTestClick = async () => {
  const demoSupport = $fileSupportsDemo.getState();

  await sendLevelTo({
    baseUrl: TEST_LEVEL_URL,
    target: demoSupport ? "test-level" : undefined,
    // actionTitle: "Test level",
    serviceTitle: TEST_LEVEL_TITLE,
    // $confirmed: $prefConfirmedTestSO,
    Confirm: ConfirmTestSO,
    onConfirmed: demoSupport ? rememberDemoTarget : undefined,
  });
};

const ConfirmPlayDemoSO: FC = () => (
  <ConfirmSO toDoWhat="To play embedded demo in level" />
);

const handleDemoClick = () =>
  sendLevelTo({
    baseUrl: TEST_DEMO_URL,
    withDemo: true,
    // actionTitle: "Play demo",
    serviceTitle: TEST_LEVEL_TITLE,
    // $confirmed: $prefConfirmedTestSO,
    Confirm: ConfirmPlayDemoSO,
  });
