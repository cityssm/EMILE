type RecordTable = 'AssetCategories';
export declare function moveRecordDown(recordTable: RecordTable, recordId: number): Promise<boolean>;
export declare function moveRecordDownToBottom(recordTable: RecordTable, recordId: number): Promise<boolean>;
export declare function moveRecordUp(recordTable: RecordTable, recordId: number): Promise<boolean>;
export declare function moveRecordUpToTop(recordTable: RecordTable, recordId: number): Promise<boolean>;
export {};
