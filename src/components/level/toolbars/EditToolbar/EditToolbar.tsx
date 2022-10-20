import { FC, PropsWithChildren, ReactNode } from "react";
import cn from "classnames";
import { Store } from "effector";
import { useStore } from "effector-react";
import { ReactComponent as MurphyRuns } from "assets/img/murphy-run-right.svg";
import { TEST_DEMO_URL, TEST_LEVEL_TITLE, TEST_LEVEL_URL } from "configs";
import { getDriver, levelSupportsDemo } from "drivers";
import { ReactComponent as DiskYellow } from "drivers/supaplex/tiles-svg/12-yellow-disk.svg";
import { ReactComponent as HwLampGreen } from "drivers/supaplex/tiles-svg/1d-hw-g-lamp.svg";
import {
  $currentDriverName,
  $currentLevelUndoQueue,
  redoCurrentLevel,
  undoCurrentLevel,
} from "models/levelsets";
import { $fileSupportsDemo, rememberDemoTarget } from "models/levelsets/demo";
import { $prefConfirmedTestSO, setPrefAskTestSO } from "models/preferences";
import { Button, TextButton, Toolbar, ToolbarSeparator } from "ui/button";
import { ask, msgBox } from "ui/feedback";
import { IconStack, IconStackType, svgs } from "ui/icon";
import { Checkbox } from "ui/input";
import { ColorType, ContainerProps } from "ui/types";
import cl from "./EditToolbar.module.scss";

const TEST_WITH_DEMO_STACK: IconStack = [[IconStackType.Index, <DiskYellow />]];
const PLAY_DEMO_STACK: IconStack = [[IconStackType.Index, <HwLampGreen />]];

interface Props extends ContainerProps {}

export const EditToolbar: FC<Props> = ({ className, ...rest }) => {
  // const driverName = useStore($currentDriverName)!;
  // const driver = getDriver(driverName)!;
  const demoSupport = useStore($fileSupportsDemo);
  const undoQueue = useStore($currentLevelUndoQueue)!;

  const rawLevel = undoQueue.current;
  const hasDemo =
    demoSupport && levelSupportsDemo(rawLevel) && rawLevel.demo !== null;

  return (
    <Toolbar {...rest} className={cn(cl.root, className)}>
      <Button
        icon={<svgs.Undo />}
        disabled={!undoQueue.canUndo}
        onClick={undoCurrentLevel}
      />
      <Button
        icon={<svgs.Redo />}
        disabled={!undoQueue.canRedo}
        onClick={redoCurrentLevel}
      />
      <ToolbarSeparator />
      {/*<Button icon={<svgs.Cut />} disabled />*/}
      {/*<Button icon={<svgs.Copy />} disabled />*/}
      {/*<Button icon={<svgs.Paste />} disabled />*/}
      {/*<Button icon={<svgs.DeleteSelection />} disabled />*/}
      {/*<Button disabled>PNG</Button>*/}
      {/*<ToolbarSeparator />*/}
      {/*<Button disabled>Copy level to clipboard</Button>*/}
      {/*<Button disabled>Paste level from clipboard</Button>*/}
      {/*<Button disabled>Internal/System clipboard? (via textarea?)</Button>*/}
      <TextButton
        onClick={handleTestClick}
        icon={<MurphyRuns />}
        iconStack={demoSupport ? TEST_WITH_DEMO_STACK : undefined}
        title={`Test level at ${TEST_LEVEL_TITLE}${
          demoSupport ? " (+record a demo)" : ""
        }`}
      />
      {demoSupport && (
        <TextButton
          onClick={handleDemoClick}
          icon={<MurphyRuns />}
          iconStack={PLAY_DEMO_STACK}
          title={`Play embedded demo with ${TEST_LEVEL_TITLE}`}
          disabled={!hasDemo}
        />
      )}
    </Toolbar>
  );
};

const packLevelToSend = () => {
  const { writer, createLevelset } = getDriver($currentDriverName.getState()!)!;
  if (!writer) {
    return;
  }
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

  return window.btoa(
    String.fromCharCode(
      ...new Uint8Array(writer.writeLevelset(createLevelset([level]))),
    ),
  );
};

const sendLevelTo = ({
  url,
  target,
  actionTitle,
  serviceTitle,
  $confirmed,
  Confirm,
  onConfirmed,
}: {
  url: string;
  target?: string;
  actionTitle: string;
  serviceTitle: string;
  $confirmed: Store<boolean>;
  Confirm: FC<PropsWithChildren<{}>>;
  onConfirmed?: () => void;
}) => {
  const targetOrBlank = target ?? "_blank";
  const rel = target ? "opener" : "noopener noreferrer";

  if ($confirmed.getState()) {
    if (!window.open(url, targetOrBlank)) {
      msgBox(
        <div>
          <p>Could not open new window. Follow the link:</p>
          <p>
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href={url} target={targetOrBlank} rel={rel}>
              {actionTitle} at {serviceTitle}
            </a>
          </p>
        </div>,
        { button: { text: "Close" } },
      );
    }
    return;
  }

  ask(<Confirm />, {
    buttons: {
      okText: `Go to ${serviceTitle} test`,
      ok: {
        uiColor: ColorType.SUCCESS,
        href: url,
        target: targetOrBlank,
        rel: rel,
        onClick: (e) => {
          onConfirmed?.();
          if (window.open(url, targetOrBlank)) {
            e.preventDefault();
          }
        },
      },
    },
  });
};

const ConfirmSO: FC<PropsWithChildren<{ toDoWhat: ReactNode }>> = ({
  toDoWhat,
  children,
}) => {
  const confirmed = useStore($prefConfirmedTestSO);

  return (
    <div>
      <p>
        {toDoWhat}, it <strong>will be sent to</strong>{" "}
        <a href={TEST_LEVEL_URL} target="_blank" rel="noopener noreferrer">
          {TEST_LEVEL_TITLE} test page
        </a>
        . It will be opened in new tab/window, so you will not loss undo history
        in current editing session.
      </p>
      {children}
      <div>
        <Checkbox checked={confirmed} onChange={setPrefAskTestSO}>
          Don't show this confirmation again
        </Checkbox>
      </div>
    </div>
  );
};

const ConfirmTestSO: FC = () => {
  const demoSupport = useStore($fileSupportsDemo);

  return (
    <ConfirmSO toDoWhat="To test a level">
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
  const packedLevel = packLevelToSend();
  if (!packedLevel) {
    return;
  }
  const url = `${TEST_LEVEL_URL}#${packedLevel}`;
  const demoSupport = $fileSupportsDemo.getState();

  sendLevelTo({
    url,
    target: demoSupport ? "test-level" : undefined,
    actionTitle: "Test level",
    serviceTitle: TEST_LEVEL_TITLE,
    $confirmed: $prefConfirmedTestSO,
    Confirm: ConfirmTestSO,
    onConfirmed: demoSupport ? rememberDemoTarget : undefined,
  });
};

const ConfirmPlayDemoSO: FC = () => (
  <ConfirmSO toDoWhat="To play embedded demo in level" />
);

const handleDemoClick = () => {
  const packedLevel = packLevelToSend();
  if (!packedLevel) {
    return;
  }
  const url = `${TEST_DEMO_URL}#${packedLevel}`;

  sendLevelTo({
    url,
    actionTitle: "Play demo",
    serviceTitle: TEST_LEVEL_TITLE,
    $confirmed: $prefConfirmedTestSO,
    Confirm: ConfirmPlayDemoSO,
  });
};
