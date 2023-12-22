import { FC, useCallback } from "react";
import { useUnit } from "effector-react";
import {
  IBaseLevel,
  Interaction,
  InteractionDialog,
  InteractionType,
} from "drivers";
import { $interactions, removeInteraction } from "models/levels";
import { $currentLevelUndoQueue, updateCurrentLevel } from "models/levelsets";

export const DriverInteractions: FC = () => {
  const interactions = useUnit($interactions);

  return (
    <>
      {interactions.map(({ i, k }) => (
        <DriverInteraction key={k} interaction={i} />
      ))}
    </>
  );
};

interface IProps<I extends Interaction<IBaseLevel> = Interaction<IBaseLevel>> {
  interaction: I;
}

const DriverInteraction: FC<IProps> = ({ interaction }) => {
  switch (interaction.type) {
    case InteractionType.DIALOG: {
      return <IDialog interaction={interaction} />;
    }

    default:
      return null;
  }
};

const IDialog: FC<IProps<InteractionDialog<IBaseLevel>>> = ({
  interaction,
}) => {
  const { Component, cell } = interaction;
  const level = useUnit($currentLevelUndoQueue)!.current;

  const onCancel = useCallback(
    () => removeInteraction(interaction),
    [interaction],
  );
  const onSubmit = useCallback(
    (level: IBaseLevel) => {
      updateCurrentLevel(level);
      removeInteraction(interaction);
    },
    [interaction],
  );

  return (
    <Component cell={cell} level={level} submit={onSubmit} cancel={onCancel} />
  );
};
