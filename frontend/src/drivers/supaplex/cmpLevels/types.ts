import { ISupaplexSpecPortRecordReadonly } from "../internal";

export type SpecPortWhichProps = Record<
  keyof ISupaplexSpecPortRecordReadonly,
  boolean
>;
