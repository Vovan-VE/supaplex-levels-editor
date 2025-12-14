import cn from "classnames";
import { FC, InputHTMLAttributes, RefAttributes } from "react";
import cl from "./Input.module.scss";

export interface InputProps
  extends
    InputHTMLAttributes<HTMLInputElement>,
    RefAttributes<HTMLInputElement> {}

export const Input: FC<InputProps> = ({ ref, className, ...rest }) => (
  <input {...rest} ref={ref} className={cn(cl.root, className)} />
);
