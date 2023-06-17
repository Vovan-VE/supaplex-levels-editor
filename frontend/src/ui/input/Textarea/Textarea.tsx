import cn from "classnames";
import { forwardRef, TextareaHTMLAttributes } from "react";
import cl from "./Textarea.module.scss";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...rest }, ref) => (
    <textarea {...rest} ref={ref} className={cn(cl.root, className)} />
  ),
);
