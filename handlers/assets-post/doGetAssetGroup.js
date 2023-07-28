import { getAssetGroup } from '../../database/getAssetGroup.js';
export function handler(request, response) {
    const assetGroup = getAssetGroup(request.body.groupId, request.session.user);
    response.json({
        success: assetGroup !== undefined,
        assetGroup
    });
}
export default handler;
