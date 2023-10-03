import { isLocal } from '@cityssm/is-private-network-address';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function addUserAccessLog(sessionUser, requestIp) {
    const ipAddress = isLocal(requestIp) ? 'localhost' : requestIp;
    const rightNowMillis = Date.now();
    const emileDB = await getConnectionWhenAvailable();
    const result = emileDB
        .prepare(`insert into UserAccessLog
        (userName, ipAddress, accessTimeMillis)
        values (?, ?, ?)`)
        .run(sessionUser.userName, ipAddress, rightNowMillis);
    emileDB.close();
    return result.changes > 0;
}
