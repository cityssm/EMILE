import { getAssets } from '../../database/getAssets.js';
import { updateAsset } from '../../database/updateAsset.js';
export function handler(request, response) {
    const success = updateAsset(request.body, request.session.user);
    const assets = getAssets({});
    response.json({
        success,
        assets
    });
}
export default handler;
