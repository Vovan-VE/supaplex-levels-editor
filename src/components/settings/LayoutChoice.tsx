import { useStore } from "effector-react";
import { FC } from "react";
import { $layoutType, LayoutType, setLayoutType } from "models/settings";
import { Field, RadioGroup, RadioOptions } from "ui/input";

const OPTIONS: RadioOptions<LayoutType> = [
  { value: LayoutType.AUTO, label: "Auto responsive" },
  { value: LayoutType.COMPACT, label: "Force Compact" },
  { value: LayoutType.FULL, label: "Force Full" },
];

export const LayoutChoice: FC = () => (
  <Field labelElement="div" label="Layout">
    <RadioGroup
      options={OPTIONS}
      value={useStore($layoutType)}
      onChange={setLayoutType}
      flowInline
    />
  </Field>
);
