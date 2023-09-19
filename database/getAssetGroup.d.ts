import type { AssetGroup } from '../types/recordTypes.js';
export declare function getAssetGroup(groupId: number | string, sessionUser: EmileUser): Promise<AssetGroup | undefined>;
