import { getAssetGroups } from '../../database/getAssetGroups.js';
import { updateAssetGroup } from '../../database/updateAssetGroup.js';
export async function handler(request, response) {
    const success = updateAssetGroup(request.body, request.session.user);
    const assetGroups = await getAssetGroups(request.session.user);
    response.json({
        success,
        assetGroups
    });
}
export default handler;
