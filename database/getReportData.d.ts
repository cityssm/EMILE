export type ReportParameters = Record<string, string | number>;
interface GetReportDataReturn {
    data: unknown[];
    header?: string[];
}
export declare function getReportData(reportName: string, reportParameters?: ReportParameters): Promise<GetReportDataReturn | undefined>;
export default getReportData;
