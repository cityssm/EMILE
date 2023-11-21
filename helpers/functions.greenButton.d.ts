import { type types as GreenButtonTypes } from '@cityssm/green-button-parser';
import type sqlite from 'better-sqlite3';
export declare const greenButtonAssetAliasType: import("../types/recordTypes.js").AssetAliasType | undefined;
export declare function recordGreenButtonData(greenButtonJson: GreenButtonTypes.GreenButtonJson, options: {
    assetId?: number;
    fileId?: number;
}, connectedEmileDB?: sqlite.Database): Promise<number>;
