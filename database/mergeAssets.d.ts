interface MergeAssetsForm {
    assetIds: string;
    categoryId: string;
    assetName: string;
    latitudeLongitude?: '' | `${number}::${number}`;
}
export declare function mergeAssets(assetForm: MergeAssetsForm, sessionUser: EmileUser): number;
export {};
