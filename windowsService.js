import path from 'node:path';
const _dirname = '.';
export const serviceConfig = {
    name: 'EMILE',
    description: 'Energy Monitoring in Less Effort',
    script: path.join(_dirname, 'bin', 'www.js')
};
