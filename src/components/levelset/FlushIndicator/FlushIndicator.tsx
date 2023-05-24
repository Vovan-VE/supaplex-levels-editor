import cn from "classnames";
import { useStore } from "effector-react";
import { FC, useMemo } from "react";
import { $displayReadOnly } from "backend";
import { APP_TITLE } from "configs";
import { $flushError, $isFlushPending } from "models/levelsets/flush";
import { TextButton } from "ui/button";
import { msgBox, Spinner } from "ui/feedback";
import { svgs } from "ui/icon";
import { ColorType, ContainerProps } from "ui/types";
import cl from "./FlushIndicator.module.scss";

interface Props extends ContainerProps {}

export const FlushIndicator: FC<Props> = ({ className, ...rest }) => {
  const readOnly = useStore($displayReadOnly);
  const isPending = useStore($isFlushPending);
  const error = useStore($flushError);

  const handleErrorClick = useMemo(
    () =>
      error
        ? () =>
            msgBox(
              <>
                Failed to flush data to storage:
                <br />
                {error!.message}
              </>,
              {
                size: "small",
              },
            )
        : undefined,
    [error],
  );

  return readOnly ? (
    <TextButton
      {...rest}
      key="r"
      uiColor={ColorType.WARN}
      className={cn(cl.readonly, className)}
      icon={<svgs.Warning />}
      onClick={handleReadOnlyClick}
      title="This instance is in Read Only mode"
    />
  ) : isPending ? (
    <TextButton
      {...rest}
      key="p"
      className={cn(cl.pending, className)}
      icon={<Spinner />}
      title="Flushing data to storage..."
    />
  ) : (
    <TextButton
      {...rest}
      key="e"
      uiColor={ColorType.DANGER}
      className={cn(error ? cl.error : cl.success, className)}
      icon={<svgs.Cross />}
      onClick={handleErrorClick}
      title="Could not flush data to storage"
    />
  );
};

const handleReadOnlyClick = () =>
  msgBox(
    <>
      <p>
        This <strong>{APP_TITLE}</strong> instance now is in{" "}
        <strong>Read Only</strong> mode because a different "main" instance was
        detected in the past.
      </p>
      <p>
        Check other opened tabs in current browser session. Either close
        unnecessary this tab to continue in another opened, or close another
        tabs and then reload this tab.
      </p>
      <p>
        In <strong>Read Only</strong> mode <strong>{APP_TITLE}</strong> WILL NOT
        WRITE anything INTO BROWSER STORAGE. This means it WILL NOT remember any
        changes you made in <strong>Read Only</strong> mode.
      </p>
    </>,
    { size: "small" },
  );
