import { EventCallable, Store } from "effector";
import { useUnit } from "effector-react";
import { FC, ReactNode } from "react";
import { TEST_LEVEL_TITLE } from "configs";
import { $prefConfirmedTestSO, setPrefAskTestSO } from "models/settings";
import { Checkbox, Field } from "ui/input";

interface _Confirm {
  state: Store<boolean>;
  update: EventCallable<boolean>;
  title: ReactNode;
}

const not = (b: any) => !b;

const invert = ({ state, update, ...rest }: _Confirm): _Confirm => ({
  ...rest,
  state: state.map(not),
  update: update.prepend(not),
});

const ConfirmCheckbox: FC<_Confirm> = ({ state, update, title }) => (
  <Checkbox checked={useUnit(state)} onChange={update}>
    {title}
  </Checkbox>
);

const CONFIRMS: _Confirm[] = [
  invert({
    state: $prefConfirmedTestSO,
    update: setPrefAskTestSO,
    title: `Before send level/demo to ${TEST_LEVEL_TITLE}`,
  }),
];

export const Confirmations: FC = () => (
  // TODO: i18n
  <Field label="Ask confirmation">
    {CONFIRMS.map((c, i) => (
      <ConfirmCheckbox key={i} {...c} />
    ))}
  </Field>
);
