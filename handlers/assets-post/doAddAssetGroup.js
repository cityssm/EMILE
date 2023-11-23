import { addAssetGroup } from '../../database/addAssetGroup.js';
import { getAssetGroups } from '../../database/getAssetGroups.js';
export async function handler(request, response) {
    const groupId = addAssetGroup(request.body, request.session.user);
    const assetGroups = await getAssetGroups(request.session.user);
    response.json({
        success: true,
        groupId,
        assetGroups
    });
}
export default handler;
