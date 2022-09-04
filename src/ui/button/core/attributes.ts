import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
} from "react";
import { keysTuple } from "utils/types";

export interface BaseProps extends HTMLAttributes<HTMLElement> {}

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

type LinkExtraProps = Omit<LinkProps, keyof BaseProps>;
type ButtonExtraProps = Omit<ButtonProps, keyof BaseProps>;

type LinkExtraPropsKeys = keyof LinkExtraProps;
type ButtonExtraPropsKeys = keyof ButtonExtraProps;

type CommonExtraPropKeys = LinkExtraPropsKeys & ButtonExtraPropsKeys;

type LinkSharedProps = Pick<LinkProps, CommonExtraPropKeys>;
type ButtonSharedProps = Pick<ButtonProps, CommonExtraPropKeys>;

type CommonExtraProp = {
  [K in keyof (LinkSharedProps | ButtonSharedProps)]:
    | LinkSharedProps[K]
    | ButtonSharedProps[K];
};

type LinkUniqProps = Omit<LinkExtraProps, CommonExtraPropKeys>;
type ButtonUniqProps = Omit<ButtonExtraProps, CommonExtraPropKeys>;

export interface AttributesProps
  extends BaseProps,
    LinkUniqProps,
    ButtonUniqProps,
    CommonExtraProp {}

const makeHelpers = <Me, Opposite>(
  specificKeys: readonly (keyof AttributesProps)[],
) => ({
  is: (props: AttributesProps): props is Me =>
    specificKeys.some((p) => props.hasOwnProperty(p)),

  omit: (props: AttributesProps) => {
    const next = { ...props };
    let found = false;
    for (let p of specificKeys) {
      if (delete next[p]) {
        found = true;
      }
    }
    return (found ? next : props) as Opposite;
  },
});

const LINK_UNIQ_KEYS = keysTuple<keyof LinkUniqProps>()([
  // most used
  "href",
  "rel",
  "target",
  // rest alphabetical
  "download",
  "hrefLang",
  "media",
  "ping",
  "referrerPolicy",
] as const);

const BUTTON_UNIQ_KEYS = keysTuple<keyof ButtonUniqProps>()([
  "disabled",
  "name",
  "value",
  "autoFocus",
  "form",
  "formAction",
  "formEncType",
  "formMethod",
  "formNoValidate",
  "formTarget",
] as const);

export const { is: isLinkProps, omit: deleteLinkProps } = makeHelpers<
  LinkUniqProps,
  ButtonProps
>(LINK_UNIQ_KEYS);

export const { omit: deleteButtonProps } = makeHelpers<
  ButtonUniqProps,
  LinkProps
>(BUTTON_UNIQ_KEYS);