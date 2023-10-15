import { FC, useCallback } from "react";
import { Checkbox, Field } from "ui/input";
import { DemoToTextConfigProps } from "../types";
import { ToTextOptions } from "./demoText";

export const DemoToTextConfig: FC<DemoToTextConfigProps<ToTextOptions>> = ({
  options,
  onChange,
}) => (
  <Field
    help={
      <>
        When enabled, <code>42</code> frames becomes 5 tiles + 2 frames and
        writes as <code>5.2</code>
        <br />
        <code>40</code> frames becomes exactly 5 tiles as <code>5.</code>
        <br />
        <code>2</code> frames kept as <code>2</code>
      </>
    }
  >
    <Checkbox
      checked={options.useTilesTime ?? false}
      onChange={useCallback(
        (useTilesTime: boolean) => onChange({ ...options, useTilesTime }),
        [onChange, options],
      )}
    >
      Use "tiles" duration
    </Checkbox>
  </Field>
);
