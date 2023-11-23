import { addAssetGroupMember } from '../../database/addAssetGroupMember.js';
import { getAssets } from '../../database/getAssets.js';
export async function handler(request, response) {
    const success = await addAssetGroupMember(request.body.groupId, request.body.assetId, request.session.user);
    const groupMembers = await getAssets({
        groupId: request.body.groupId
    });
    response.json({
        success,
        groupMembers
    });
}
export default handler;
