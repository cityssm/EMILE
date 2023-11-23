import { isLocal } from '@cityssm/is-private-network-address';
import { getConfigProperty } from '../helpers/functions.config.js';
import { getConnectionWhenAvailable } from '../helpers/functions.database.js';
const accessMillis = getConfigProperty('settings.reportKeyAccessDays') * 86400 * 1000;
export async function isValidUserReportKey(reportKey, requestIp) {
    const emileDB = await getConnectionWhenAvailable(true);
    const ipAddress = isLocal(requestIp) ? 'localhost' : requestIp;
    const userName = emileDB
        .prepare(`select u.userName
        from UserAccessLog l
        left join Users u on l.userName = u.userName
        where l.ipAddress = ?
        and u.reportKey = ?
        and u.recordDelete_timeMillis is null
        and u.canLogin = 1
        and ? - l.accessTimeMillis <= ?`)
        .pluck()
        .get(ipAddress, reportKey, Date.now(), accessMillis);
    emileDB.close();
    return (userName ?? '') !== '';
}
