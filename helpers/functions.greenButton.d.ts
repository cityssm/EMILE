import { type types as GreenButtonTypes } from '@cityssm/green-button-parser';
export declare const greenButtonAssetAliasType: import("../types/recordTypes.js").AssetAliasType | undefined;
export declare function recordGreenButtonData(greenButtonJson: GreenButtonTypes.GreenButtonJson, options: {
    assetId?: number;
    fileId?: number;
}): Promise<number>;
