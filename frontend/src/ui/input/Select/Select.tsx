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
  MultiValueProps,
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
const MultiValue = <V extends AnyKey>({
  children,
  ...props
}: PropsWithChildren<MultiValueProps<SelectOption<V>, true>>) => (
  <components.MultiValue {...props}>
    {renderIcon(props.data.icon)}
    {/*props.data.labelSelected ??*/ children}
  </components.MultiValue>
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
  MultiValue,
  Option,
};

// interface Props<V extends AnyKey, IsMulti extends boolean>
//   extends RSelectProps<SelectOption<V>, IsMulti> {}

interface PropsSingle<V extends AnyKey>
  extends RSelectProps<SelectOption<V>, false> {
  isMulti?: false;
  value?: SelectOption<V> | null;
}

interface PropsMulti<V extends AnyKey>
  extends RSelectProps<SelectOption<V>, true> {
  isMulti: true;
  value?: readonly SelectOption<V>[];
}

interface ISelect {
  <V extends AnyKey>(props: PropsMulti<V>): ReactElement;
  <V extends AnyKey>(props: PropsSingle<V>): ReactElement;
}

export const Select: ISelect = <
  V extends AnyKey,
  // IsMulti extends boolean = false,
>(
  // props: Props<V, IsMulti>,
  props: PropsMulti<V> | PropsSingle<V>,
) => {
  const ref = useRef<SelectClass<SelectOption<V>, boolean> | null>(null);
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
          <RSelect<SelectOption<V>, boolean>
            {...(props as RSelectProps<SelectOption<V>, boolean>)}
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
