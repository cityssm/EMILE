import { addAssetAlias } from '../../database/addAssetAlias.js';
import { getAssetAliases } from '../../database/getAssetAliases.js';
export async function handler(request, response) {
    const aliasId = await addAssetAlias(request.body, request.session.user);
    const assetAliases = await getAssetAliases({
        assetId: request.body.assetId
    });
    response.json({
        success: true,
        aliasId,
        assetAliases
    });
}
export default handler;
