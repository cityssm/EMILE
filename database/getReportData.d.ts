export type ReportParameters = Record<string, string | number>;
export declare function getReportData(reportName: string, reportParameters?: ReportParameters): unknown[] | undefined;
export default getReportData;
