import { FC, ReactElement, ReactNode } from "react";
import { ISupportReport, SupportReportType } from "drivers";
import { Trans } from "i18n/Trans";
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
  [SupportReportType.ERR]: <Trans i18nKey="main:files.convert.SummaryErrors" />,
  [SupportReportType.WARN]: (
    <Trans i18nKey="main:files.convert.SummaryWarnings" />
  ),
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
                <Trans
                  i18nKey="main:files.convert.LevelIndex"
                  values={{ index: levelIndex + 1 }}
                />{" "}
              </>
            )}
            {message}
          </li>
        ))}
      </ul>
    </div>
    {type !== SupportReportType.ERR && (
      <div className={cl.foot}>
        <Trans i18nKey="main:files.convert.HintNewFileWill" />
      </div>
    )}
  </div>
);
