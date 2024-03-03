import { FC, useCallback, useMemo } from "react";
import { useUnit } from "effector-react";
import {
  IBaseLevel,
  Interaction,
  InteractionDialog,
  InteractionType,
} from "drivers";
import { $interactions, removeInteraction } from "models/levels";
import {
  $currentFileRo,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";

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
  const isRo = useUnit($currentFileRo);

  const onCancel = useCallback(
    () => removeInteraction(interaction),
    [interaction],
  );
  const onSubmit = useMemo(
    () =>
      isRo
        ? undefined
        : (level: IBaseLevel) => {
            updateCurrentLevel(level);
            removeInteraction(interaction);
          },
    [interaction, isRo],
  );

  return (
    <Component cell={cell} level={level} submit={onSubmit} cancel={onCancel} />
  );
};
