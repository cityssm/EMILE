import { deleteAssetAlias } from '../../database/deleteAssetAlias.js';
import { getAssetAliases } from '../../database/getAssetAliases.js';
export function handler(request, response) {
    const success = deleteAssetAlias(request.body.aliasId, request.session.user);
    const assetAliases = getAssetAliases({
        assetId: request.body.assetId
    });
    response.json({
        success,
        assetAliases
    });
}
export default handler;
