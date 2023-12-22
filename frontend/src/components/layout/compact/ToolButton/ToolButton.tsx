import { useUnit } from "effector-react";
import { FC } from "react";
import { EditorToolsSimple } from "components/level/toolbars/EditorTools";
import { $toolIndex, $toolVariant, TOOLS } from "models/levels/tools";
import { ButtonDropdown } from "ui/button";
import cl from "./ToolButton.module.scss";

export const ToolButton: FC = () => {
  const toolIndex = useUnit($toolIndex);
  const variantIndex = useUnit($toolVariant);
  const CurIcon = TOOLS[toolIndex].variants[variantIndex].Icon;
  return (
    <ButtonDropdown triggerIcon={<CurIcon />} noArrow>
      <EditorToolsSimple className={cl.toolbar} />
    </ButtonDropdown>
  );
};
