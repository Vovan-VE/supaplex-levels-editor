import { FC } from "react";
import SpinnerSvg from "assets/img/spinner.svg?react";
import { IconContainer } from "../../icon";

interface Props {
  inline?: boolean;
}

export const Spinner: FC<Props> = ({ inline = false }) =>
  inline ? (
    <IconContainer>
      <SpinnerSvg />
    </IconContainer>
  ) : (
    <SpinnerSvg />
  );
