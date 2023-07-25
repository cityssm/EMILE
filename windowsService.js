import path from 'node:path';
const _dirname = '.';
export const serviceConfig = {
    name: 'MonTY',
    description: 'MONitor and Track Your...',
    script: path.join(_dirname, 'bin', 'www.js')
};
