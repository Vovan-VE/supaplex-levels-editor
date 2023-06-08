import { FC } from "react";
import { ReactComponent as SpinnerSvg } from "assets/img/spinner.svg";
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
