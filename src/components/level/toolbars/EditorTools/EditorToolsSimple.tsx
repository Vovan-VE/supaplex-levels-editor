import { useStore } from "effector-react";
import { FC } from "react";
import {
  $toolIndex,
  $toolVariant,
  setTool,
  setToolVariant,
  TOOLS,
} from "models/levels/tools";
import { Button, Toolbar } from "ui/button";
import { ColorType, ContainerProps } from "ui/types";

const handleClicks = TOOLS.map(({ variants }, ti) =>
  variants.map((_, vi) => () => {
    setTool(ti);
    setToolVariant(vi);
  }),
);

export const EditorToolsSimple: FC<ContainerProps> = (props) => {
  const toolIndex = useStore($toolIndex);
  const variantIndex = useStore($toolVariant);
  return (
    <Toolbar {...props}>
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
      {/*{Array.from({ length: 3 }).map((_, i) => (*/}
      {/*  <Button key={i} icon={<svgs.Menu />} disabled />*/}
      {/*))}*/}
    </Toolbar>
  );
};
