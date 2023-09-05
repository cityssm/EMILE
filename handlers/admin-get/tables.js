import { getRegularIconClasses, getSolidIconClasses } from '@cityssm/font-awesome-v5-iconclasses';
import { getAssetCategories } from '../../helpers/functions.cache.js';
export async function handler(request, response) {
    const assetCategories = getAssetCategories();
    const faSolidClassNames = await getSolidIconClasses();
    const faRegularClassNames = await getRegularIconClasses();
    response.render('admin-tables', {
        headTitle: 'Table Maintenance',
        menuItem: 'Settings',
        assetCategories,
        faSolidClassNames,
        faRegularClassNames
    });
}
export default handler;
