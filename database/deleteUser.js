import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function deleteUser(userName, sessionUser) {
    const emileDB = await getConnectionWhenAvailable();
    const result = emileDB
        .prepare(`update Users
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and userName = ?`)
        .run(sessionUser.userName, Date.now(), userName);
    emileDB.close();
    return result.changes > 0;
}
