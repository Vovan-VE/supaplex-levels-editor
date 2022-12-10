import { FC, ReactElement, ReactNode } from "react";
import { ISupportReport, SupportReportType } from "drivers";
import { IconContainer, svgs } from "ui/icon";
import cl from "./SupportReport.module.scss";

const ICON: Record<SupportReportType, ReactElement> = {
  [SupportReportType.ERR]: (
    <IconContainer className={cl._err}>
      <svgs.Cross />
    </IconContainer>
  ),
  [SupportReportType.WARN]: (
    <IconContainer className={cl._warn}>
      <svgs.Warning />
    </IconContainer>
  ),
};
const SUMMARY: Record<SupportReportType, ReactNode> = {
  [SupportReportType.ERR]: (
    <>Conversion impossible due to the following errors.</>
  ),
  [SupportReportType.WARN]: <>Conversion will cause the following changes.</>,
};

interface Props {
  report: ISupportReport;
}

export const SupportReport: FC<Props> = ({ report: { type, messages } }) => (
  <div className={cl.root}>
    <div className={cl.head}>
      {ICON[type]} {SUMMARY[type]}
    </div>
    <div className={cl.messages}>
      <ul>
        {messages.map(({ type, message, levelIndex = null }, i) => (
          <li key={i}>
            {ICON[type]}{" "}
            {levelIndex !== null && (
              <>
                <b>level {levelIndex + 1}</b>:{" "}
              </>
            )}
            {message}
          </li>
        ))}
      </ul>
    </div>
    {type !== SupportReportType.ERR && (
      <div className={cl.foot}>
        A new levelset will be created, so it's nothing to loose.
      </div>
    )}
  </div>
);
