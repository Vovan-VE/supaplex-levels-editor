/// <reference types="react-scripts" />

declare module "classnames" {
  import classnames from "classnames/";

  // reexport shortcut alias to let IDE add import automatically by `cn` name:
  //
  //     return <div className={cn('foo')} />;
  //                          ---><---
  //     <Ctrl+Space> with cursor here, autocomplete `cn(...)`
  const cn = classnames;

  export = cn;
}
