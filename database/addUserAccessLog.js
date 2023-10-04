import { isLocal } from '@cityssm/is-private-network-address';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
export async function addUserAccessLog(sessionUser, requestIp) {
    const ipAddress = isLocal(requestIp) ? 'localhost' : requestIp;
    const rightNowMillis = Date.now();
    let emileDB;
    try {
        emileDB = await getConnectionWhenAvailable();
        const result = emileDB
            .prepare(`insert into UserAccessLog
        (userName, ipAddress, accessTimeMillis)
        values (?, ?, ?)`)
            .run(sessionUser.userName, ipAddress, rightNowMillis);
        return result.changes > 0;
    }
    catch {
        return false;
    }
    finally {
        if (emileDB !== undefined) {
            emileDB.close();
        }
    }
}
