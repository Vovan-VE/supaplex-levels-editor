import { useStore } from "effector-react";
import { FC } from "react";
import {
  $toolIndex,
  $toolVariant,
  setTool,
  setToolVariant,
  TOOLS,
} from "models/levels/tools";
import { Button, ButtonDropdown, Toolbar } from "ui/button";
import { ColorType } from "ui/types";
// import cl from "./ToolButton.module.scss";

const handleClicks = TOOLS.map(({ variants }, ti) =>
  variants.map((_, vi) => () => {
    setTool(ti);
    setToolVariant(vi);
  }),
);

export const ToolButton: FC = () => {
  const toolIndex = useStore($toolIndex);
  const variantIndex = useStore($toolVariant);

  const CurIcon = TOOLS[toolIndex].variants[variantIndex].Icon;
  return (
    <ButtonDropdown triggerIcon={<CurIcon />} noArrow>
      <Toolbar>
        {TOOLS.map(({ variants }, ti) =>
          variants.map(({ title, Icon }, vi) => (
            <Button
              key={`${ti}:${vi}`}
              icon={<Icon />}
              title={title}
              uiColor={
                ti === toolIndex && vi === variantIndex
                  ? ColorType.WARN
                  : undefined
              }
              onClick={handleClicks[ti][vi]}
            />
          )),
        )}
      </Toolbar>
    </ButtonDropdown>
  );
};
