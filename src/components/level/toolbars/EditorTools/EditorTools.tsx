import { FC } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { Rect } from "@popperjs/core";
import {
  $toolIndex,
  $toolsVariants,
  setTool,
  setToolVariant,
  TOOLS,
} from "models/levels/tools";
import { Button, ButtonDropdown, TextButton, Toolbar } from "ui/button";
import { ColorType, ContainerProps } from "ui/types";
import cl from "./EditorTools.module.scss";

interface Props extends ContainerProps {}

const mod = [
  {
    name: "offset",
    options: {
      offset: ({ reference }: { reference: Rect }) => [0, -reference.width],
    },
  },
];

const selectedColor = ColorType.WARN;

const handleClicks = TOOLS.map(({ variants }, ti) => ({
  onTool: () => setTool(ti),
  onVariants: variants.map((_, vi) => () => {
    setTool(ti);
    setToolVariant(vi);
  }),
}));

export const EditorTools: FC<Props> = ({ className, ...rest }) => {
  const toolIndex = useStore($toolIndex);
  const toolsVariants = useStore($toolsVariants);

  return (
    <Toolbar {...rest} className={cn(cl.root, className)}>
      {TOOLS.map(({ variants }, ti) => {
        const curVariantIndex = toolsVariants[ti];
        const v = variants[curVariantIndex];
        const { onTool, onVariants } = handleClicks[ti];

        const toolColor = ti === toolIndex ? selectedColor : undefined;
        const curVariantButton = (
          <Button
            key={ti}
            icon={<v.Icon />}
            title={v.title}
            uiColor={toolColor}
            onClick={onTool}
          />
        );

        if (variants.length === 1) {
          return curVariantButton;
        }

        return (
          <ButtonDropdown
            key={ti}
            standalone={curVariantButton}
            buttonProps={{ uiColor: toolColor }}
            placement="right"
            modifiers={mod}
          >
            <Toolbar className={cl.popupToolbar}>
              {variants.map((v, vi) => (
                <TextButton
                  key={vi}
                  icon={<v.Icon />}
                  title={v.title}
                  uiColor={
                    vi === curVariantIndex ? selectedColor : ColorType.MUTE
                  }
                  onClick={onVariants[vi]}
                />
              ))}
            </Toolbar>
          </ButtonDropdown>
        );
      })}
    </Toolbar>
  );
};
