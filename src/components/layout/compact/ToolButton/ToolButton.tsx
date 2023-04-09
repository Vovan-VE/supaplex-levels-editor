import { useStore } from "effector-react";
import { FC } from "react";
import { EditorToolsSimple } from "components/level/toolbars/EditorTools";
import { $toolIndex, $toolVariant, TOOLS } from "models/levels/tools";
import { ButtonDropdown } from "ui/button";
import cl from "./ToolButton.module.scss";

export const ToolButton: FC = () => {
  const toolIndex = useStore($toolIndex);
  const variantIndex = useStore($toolVariant);
  const CurIcon = TOOLS[toolIndex].variants[variantIndex].Icon;
  return (
    <ButtonDropdown triggerIcon={<CurIcon />} noArrow>
      <EditorToolsSimple className={cl.toolbar} />
    </ButtonDropdown>
  );
};
