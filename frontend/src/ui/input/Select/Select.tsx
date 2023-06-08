import {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import RSelect, {
  components,
  OptionProps,
  Props as RSelectProps,
  SingleValueProps,
} from "react-select";
import type SelectClass from "react-select/dist/declarations/src/Select";
import { AnyKey } from "@cubux/types";
import { ClickOutside } from "ui/helpers";
import { IconContainer } from "ui/icon";
import "./Select.scss";

const CL_ICON = "_icon";

export interface SelectOption<V extends AnyKey> {
  value: V;
  icon?: ReactElement;
  label?: string;
  labelSelected?: string;
}

const renderIcon = (icon?: ReactElement): ReactNode =>
  icon && <IconContainer className={CL_ICON}>{icon}</IconContainer>;

const SingleValue = <V extends AnyKey>({
  children,
  ...props
}: PropsWithChildren<SingleValueProps<SelectOption<V>, false>>) => (
  <components.SingleValue {...props}>
    {renderIcon(props.data.icon)}
    {props.data.labelSelected ?? children}
  </components.SingleValue>
);

const Option = <V extends AnyKey>({
  children,
  ...props
}: PropsWithChildren<OptionProps<SelectOption<V>>>) => (
  <components.Option {...props}>
    {renderIcon(props.data.icon)}
    {children}
  </components.Option>
);

const componentsOverride = {
  SingleValue,
  Option,
};

interface Props<V extends AnyKey>
  extends RSelectProps<SelectOption<V>, false> {}

export const Select = <V extends AnyKey>(props: Props<V>) => {
  const ref = useRef<SelectClass<any> | null>(null);
  const [isOpened, setOpened] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);
  const handleClose = useCallback(() => setOpened(false), []);
  const handleClickOutside = useCallback(() => {
    setOpened(false);
    ref.current?.blur();
  }, []);

  return (
    <ClickOutside
      watch={isOpened}
      triggerOnDown
      onClickOutside={handleClickOutside}
    >
      {({ getClickProps }) => (
        <div {...getClickProps()}>
          <RSelect
            {...props}
            ref={ref}
            components={componentsOverride as any}
            classNamePrefix="app-react-select"
            onMenuOpen={handleOpen}
            onMenuClose={handleClose}
            menuIsOpen={isOpened}
          />
        </div>
      )}
    </ClickOutside>
  );
};
