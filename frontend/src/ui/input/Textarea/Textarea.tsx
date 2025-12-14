import cn from "classnames";
import { FC, RefAttributes, TextareaHTMLAttributes } from "react";
import cl from "./Textarea.module.scss";

interface TextareaProps
  extends
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    RefAttributes<HTMLTextAreaElement> {}

export const Textarea: FC<TextareaProps> = ({ ref, className, ...rest }) => (
  <textarea {...rest} ref={ref} className={cn(cl.root, className)} />
);
