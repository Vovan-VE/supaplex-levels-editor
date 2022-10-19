import { FC } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { ReactComponent as MurphyRuns } from "assets/img/murphy-run-right.svg";
import { TEST_LEVEL_TITLE, TEST_LEVEL_URL } from "configs";
import { getDriver } from "drivers";
import {
  $currentDriverName,
  $currentLevelUndoQueue,
  redoCurrentLevel,
  undoCurrentLevel,
} from "models/levelsets";
import { rememberDemoTarget } from "models/levelsets/demo";
import { $prefConfirmedTestSO, setPrefAskTestSO } from "models/preferences";
import { Button, TextButton, Toolbar, ToolbarSeparator } from "ui/button";
import { ask, msgBox } from "ui/feedback";
import { svgs } from "ui/icon";
import { Checkbox } from "ui/input";
import { ColorType, ContainerProps } from "ui/types";
import cl from "./EditToolbar.module.scss";

interface Props extends ContainerProps {}

export const EditToolbar: FC<Props> = ({ className, ...rest }) => {
  // const driverName = useStore($currentDriverName)!;
  // const driver = getDriver(driverName)!;
  const undoQueue = useStore($currentLevelUndoQueue)!;

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
        title={`Test level at ${TEST_LEVEL_TITLE}`}
      />
    </Toolbar>
  );
};

const handleTestClick = () => {
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

  const url = `${TEST_LEVEL_URL}#${window.btoa(
    String.fromCharCode(
      ...new Uint8Array(writer.writeLevelset(createLevelset([level]))),
    ),
  )}`;

  if ($prefConfirmedTestSO.getState()) {
    if (!window.open(url, "_blank")) {
      msgBox(
        <div>
          <p>Could not open new window. Follow the link:</p>
          <p>
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href={url} target="_blank" rel="opener">
              Test level at {TEST_LEVEL_TITLE}
            </a>
          </p>
        </div>,
        { button: { text: "Close" } },
      );
    }
    return;
  }

  ask(<ConfirmTestSO />, {
    buttons: {
      okText: `Go to ${TEST_LEVEL_TITLE} test`,
      ok: {
        uiColor: ColorType.SUCCESS,
        href: url,
        target: "_blank",
        rel: "opener",
        onClick: (e) => {
          rememberDemoTarget();
          if (window.open(url, "_blank")) {
            e.preventDefault();
          }
        },
      },
    },
  });
};

const ConfirmTestSO: FC = () => {
  const confirmed = useStore($prefConfirmedTestSO);
  const driverName = useStore($currentDriverName);
  const demoSupport =
    (driverName && getDriver(driverName)?.demoSupport) || false;

  return (
    <div>
      <p>
        To test a level, it <strong>will be sent to</strong>{" "}
        <a href={TEST_LEVEL_URL} target="_blank" rel="noopener noreferrer">
          {TEST_LEVEL_TITLE} test page
        </a>
        . It will be opened in new tab/window, so you will not loss undo history
        in current editing session.
      </p>
      {/*{demoSupport && <p>In order <strong>to save demo</strong>, please keep</p>}*/}
      <div>
        <Checkbox checked={confirmed} onChange={setPrefAskTestSO}>
          Don't show this confirmation again
        </Checkbox>
      </div>
    </div>
  );
};
