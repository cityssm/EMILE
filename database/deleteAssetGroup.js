import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
import { deleteAssetGroupMembersByGroupId } from './deleteAssetGroupMember.js';
export async function deleteAssetGroup(groupId, sessionUser) {
    const emileDB = await getConnectionWhenAvailable();
    const result = emileDB
        .prepare(`update AssetGroups
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and groupId = ?`)
        .run(sessionUser.userName, Date.now(), groupId);
    if (result.changes > 0) {
        await deleteAssetGroupMembersByGroupId(groupId, sessionUser, emileDB);
    }
    emileDB.close();
    return result.changes > 0;
}
