import { isLocal } from '@cityssm/is-private-network-address';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/functions.config.js';
import { databasePath } from '../helpers/functions.database.js';
const accessMillis = getConfigProperty('settings.reportKeyAccessDays') * 86400 * 1000;
export function isValidUserReportKey(reportKey, requestIp) {
    const emileDB = sqlite(databasePath, { readonly: true });
    const ipAddress = isLocal(requestIp) ? 'localhost' : requestIp;
    console.log(ipAddress);
    const result = emileDB
        .prepare(`select u.userName
        from UserAccessLog l
        left join Users u on l.userName = u.userName
        where l.ipAddress = ?
        and u.reportKey = ?
        and u.recordDelete_timeMillis is null
        and u.canLogin = 1
        and ? - l.accessTimeMillis <= ?`)
        .get(ipAddress, reportKey, Date.now(), accessMillis);
    emileDB.close();
    return (result?.userName ?? '') !== '';
}
