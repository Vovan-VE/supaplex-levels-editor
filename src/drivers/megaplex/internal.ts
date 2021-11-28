import { ILevelFooter as ISpLevelFooter } from "../supaplex/internal";

export interface IWithDemo {
  demo: Uint8Array | null;
}

export interface ILevelFooter extends ISpLevelFooter, IWithDemo {}
