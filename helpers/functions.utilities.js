import Debug from 'debug';
const debug = Debug('emile:function.utilities');
export async function delay(timeMillis, waitSource) {
    debug(`Waiting ${timeMillis / 1000} seconds: ${waitSource ?? ''} ...`);
    return await new Promise((resolve) => setTimeout(resolve, timeMillis));
}
