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
import { TEST_DEMO_URL, TEST_LEVEL_TITLE, TEST_LEVEL_URL } from "configs";
import {
  getDriver,
  getDriverFormat,
  IBaseLevel,
  LevelConfiguratorProps,
  levelSupportsDemo,
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
import cl from "./TestingButtons.module.scss";

const CL_SVG_ANIMATE_HOVERABLE = "svg-animate_hover-target";
const TEST_WITH_DEMO_STACK: IconStack = [[IconStackType.Index, <DiskYellow />]];
const PLAY_DEMO_STACK: IconStack = [[IconStackType.Index, <HwLampGreen />]];

export const TestingButtons: FC = () => {
  const undoQueue = useStore($currentLevelUndoQueue)!;
  const demoSupport = useStore($fileSupportsDemo);

  const rawLevel = undoQueue.current;
  const hasDemo =
    demoSupport && levelSupportsDemo(rawLevel) && rawLevel.demo !== null;

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
        <TextButton
          onClick={handleDemoClick}
          icon={<MurphyRuns />}
          iconStack={PLAY_DEMO_STACK}
          className={CL_SVG_ANIMATE_HOVERABLE}
          title={`Play embedded demo with ${TEST_LEVEL_TITLE}`}
          disabled={!hasDemo}
        />
      )}
    </>
  );
};

const packLevelToSend = (baseUrl: string) => {
  const driverName = $currentDriverName.getState()!;
  const { writeLevelset, createLevelset } = getDriverFormat(
    driverName,
    $currentDriverFormat.getState()!,
  )!;
  const level = $currentLevelUndoQueue.getState()!.current;
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

  const url = new URL(baseUrl);
  url.hash = window.btoa(
    String.fromCharCode(
      ...new Uint8Array(writeLevelset(createLevelset([level]))),
    ),
  );
  return url;
};

type ConfirmFC = FC<PropsWithChildren<LevelConfiguratorProps<IBaseLevel>>>;

const sendLevelTo = ({
  baseUrl,
  target,
  // actionTitle,
  serviceTitle,
  // $confirmed,
  Confirm,
  onConfirmed,
}: {
  baseUrl: string;
  target?: string;
  // actionTitle: string;
  serviceTitle: string;
  // $confirmed: Store<boolean>;
  Confirm: ConfirmFC;
  onConfirmed?: () => void;
}) => {
  const url = packLevelToSend(baseUrl);
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

  ask(<Confirm level={level} onChange={(l) => (level = l)} />, {
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

          if (window.open(url, targetOrBlank)) {
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

const handleTestClick = () => {
  const demoSupport = $fileSupportsDemo.getState();

  sendLevelTo({
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

const handleDemoClick = () => {
  sendLevelTo({
    baseUrl: TEST_DEMO_URL,
    // actionTitle: "Play demo",
    serviceTitle: TEST_LEVEL_TITLE,
    // $confirmed: $prefConfirmedTestSO,
    Confirm: ConfirmPlayDemoSO,
  });
};
