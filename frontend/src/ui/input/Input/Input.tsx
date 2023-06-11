import { forwardRef, InputHTMLAttributes } from "react";
import cn from "classnames";
import cl from "./Input.module.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...rest }, ref) => (
    <input {...rest} ref={ref} className={cn(cl.root, className)} />
  ),
);
