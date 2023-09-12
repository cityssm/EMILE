import { helpers as greenButtonHelpers } from '@cityssm/green-button-parser';
import * as greenButtonSubscriber from '@cityssm/green-button-subscriber';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';
import { getConfigProperty } from '../helpers/functions.config.js';
import { recordGreenButtonData } from '../helpers/functions.greenButton.js';
const debug = Debug('emile:tasks:greenButtonCMDProcessor');
let updatedMin = new Date();
updatedMin.setFullYear(updatedMin.getFullYear() - 1);
let terminateTask = false;
async function processGreenButtonSubscriptions() {
    debug('Process started');
    const startTimeMillis = Date.now();
    const greenButtonSubscriptions = getConfigProperty('subscriptions.greenButton');
    for (const [subscriptionKey, greenButtonSubscription] of Object.entries(greenButtonSubscriptions)) {
        if (terminateTask) {
            break;
        }
        debug(`Loading authorizations for subscription: ${subscriptionKey} ...`);
        greenButtonSubscriber.setConfiguration(greenButtonSubscription.configuration);
        const authorizations = await greenButtonSubscriber.getAuthorizations();
        if (authorizations === undefined) {
            debug(`Unable to retieve authorizations: ${subscriptionKey}`);
            continue;
        }
        const entries = greenButtonHelpers.getEntriesByContentType(authorizations, 'Authorization');
        if (entries.length === 0) {
            debug(`Subscription contains no authorizations: ${subscriptionKey}`);
            continue;
        }
        for (const entry of entries) {
            const authorizationId = entry.links.selfUid ?? '';
            if (authorizationId === '' ||
                (greenButtonSubscription.authorizationIdsToExclude ?? []).includes(authorizationId) ||
                (greenButtonSubscription.authorizationIdsToInclude !== undefined &&
                    !greenButtonSubscription.authorizationIdsToInclude.includes(authorizationId)) ||
                entry.content.Authorization.status_value !== 'Active') {
                debug(`Skipping authorization id: ${subscriptionKey}, ${authorizationId}`);
                continue;
            }
            const usageData = await greenButtonSubscriber.getBatchSubscriptionsByAuthorization(authorizationId, {
                updatedMin
            });
            if (usageData === undefined) {
                debug(`Unable to retrieve subscription data: ${subscriptionKey}, ${authorizationId}`);
                continue;
            }
            try {
                recordGreenButtonData(usageData, {});
            }
            catch (error) {
                debug(`Error recording data: ${subscriptionKey}, ${authorizationId}`);
                debug(error);
            }
        }
    }
    updatedMin = new Date(startTimeMillis - 3600 * 1000);
}
const intervalID = setIntervalAsync(processGreenButtonSubscriptions, 3600 * 1000);
exitHook(() => {
    terminateTask = true;
    try {
        void clearIntervalAsync(intervalID);
    }
    catch {
        debug('Error exiting task.');
    }
});
