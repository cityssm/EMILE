import { getAssetGroup } from '../../database/getAssetGroup.js';
export async function handler(request, response) {
    const assetGroup = await getAssetGroup(request.body.groupId, request.session.user);
    response.json({
        success: assetGroup !== undefined,
        assetGroup
    });
}
export default handler;
