export type ReportParameters = Record<string, string | number>;
export declare function getReportData(reportName: string, reportParameters?: ReportParameters): Promise<unknown[] | undefined>;
export default getReportData;
