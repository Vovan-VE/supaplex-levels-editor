import { useStore } from "effector-react";
import {
  ChangeEventHandler,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fmtLevelFull } from "components/levelset";
import {
  $currentBuffer,
  $currentFileName,
  $currentKey,
  setCurrentLevel,
} from "models/levelsets";
import { TextButton } from "ui/button";
import { Field, Input } from "ui/input";
import { Dialog, renderPrompt } from "ui/feedback";
import { ColorType } from "ui/types";
import { compileFilter, filterTitles } from "./filterTitles";
import cl from "./LevelsListDialog.module.scss";

interface Props {
  show: boolean;
  onSubmit: () => void;
}

const LevelsListDialog: FC<Props> = ({ show, onSubmit }) => {
  const key = useStore($currentKey);
  // close dialog when current file switched somehow
  useEffect(() => {
    if (key) {
      return onSubmit;
    }
    onSubmit();
  }, [key, onSubmit]);

  const filename = useStore($currentFileName);
  const levelset = useStore($currentBuffer);
  const index = levelset?.currentIndex;
  const levels = levelset?.levels;
  const allTitles = useMemo(
    () => levels?.map(({ undoQueue }) => undoQueue.current.title.trim()),
    [levels],
  );
  const levelsCount = levels ? levels.length : 0;
  const maxDigits = String(levelsCount).length;

  const [filter, setFilter] = useState("");
  const handleFilterChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target: { value } }) => setFilter(value),
    [],
  );
  const handleSelect = useMemo(
    () =>
      Array.from({ length: levelsCount }).map((_, i) => () => {
        setCurrentLevel(i);
        onSubmit();
      }),
    [levelsCount, onSubmit],
  );

  const filterRE = useMemo(() => compileFilter(filter), [filter]);
  const showIndices = useMemo(
    () => allTitles && filterTitles(filterRE, allTitles),
    [filterRE, allTitles],
  );

  const [refList, setRefList] = useState<HTMLDivElement | null>(null);
  const scrollDone = useRef(false);
  useEffect(() => {
    if (show && index !== undefined && !scrollDone.current && refList) {
      const item = refList.querySelector(`[value="${index}"]`);
      if (item) {
        item.scrollIntoView({
          block: "center",
        });
        scrollDone.current = true;
      }
    }
  }, [index, refList, show]);

  return (
    <Dialog
      open={show}
      onClose={onSubmit}
      title={`Levels in "${filename}"`}
      size="small"
    >
      <Field label="Filter">
        <Input
          type="text"
          value={filter}
          autoFocus
          onChange={handleFilterChange}
        />
      </Field>
      <div ref={setRefList} className={cl.list}>
        {allTitles?.map(
          (title, i) =>
            (!showIndices || showIndices.has(i)) && (
              <TextButton
                key={i}
                uiColor={i === index ? ColorType.SUCCESS : ColorType.MUTE}
                onClick={handleSelect[i]}
                // used for initial scroll position
                value={String(i)}
              >
                {fmtLevelFull(i, maxDigits, title)}
              </TextButton>
            ),
        )}
      </div>
    </Dialog>
  );
};

export const openLevelsListDialog = () =>
  renderPrompt((props) => <LevelsListDialog {...props} />);
