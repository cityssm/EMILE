import { addAssetAlias } from '../../database/addAssetAlias.js';
import { getAssetAliases } from '../../database/getAssetAliases.js';
export function handler(request, response) {
    const aliasId = addAssetAlias(request.body, request.session.user);
    const assetAliases = getAssetAliases({
        assetId: request.body.assetId
    });
    response.json({
        success: true,
        aliasId,
        assetAliases
    });
}
export default handler;
