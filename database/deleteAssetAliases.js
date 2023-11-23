import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function deleteAssetAliases(filterField, filterValue, sessionUser, connectedEmileDB) {
    const emileDB = connectedEmileDB ?? (await getConnectionWhenAvailable());
    const result = emileDB
        .prepare(`update AssetAliases
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and ${filterField} = ?`)
        .run(sessionUser.userName, Date.now(), filterValue);
    if (connectedEmileDB === undefined) {
        emileDB.close();
    }
    return result.changes > 0;
}
