import { deleteAssetGroup } from '../../database/deleteAssetGroup.js';
import { getAssetGroups } from '../../database/getAssetGroups.js';
export function handler(request, response) {
    const success = deleteAssetGroup(request.body.groupId, request.session.user);
    const assetGroups = getAssetGroups(request.session.user);
    response.json({
        success,
        assetGroups
    });
}
export default handler;
