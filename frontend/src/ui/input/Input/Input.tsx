import cn from "classnames";
import { forwardRef, InputHTMLAttributes } from "react";
import cl from "./Input.module.scss";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...rest }, ref) => (
    <input {...rest} ref={ref} className={cn(cl.root, className)} />
  ),
);
