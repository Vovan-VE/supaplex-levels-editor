import { Window } from "@wailsio/runtime";

export function setTitle(title: string): any {
  Window.SetTitle(title);
}
