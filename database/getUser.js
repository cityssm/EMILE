import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function getUser(userName) {
    const emileDB = await getConnectionWhenAvailable(true);
    const user = emileDB
        .prepare(`select userName, canLogin, canUpdate, isAdmin, reportKey
        from Users
        where recordDelete_timeMillis is null
        and userName = ?`)
        .get(userName);
    emileDB.close();
    return user;
}
