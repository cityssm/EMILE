import baseConfig from './config.base.js';
export const config = Object.assign({}, baseConfig);
config.application.useTestDatabases = true;
config.tempUsers = [
    {
        user: {
            userName: '~~testUser',
            canLogin: true,
            canUpdate: true,
            isAdmin: false
        },
        password: 'p@ssw0rd'
    },
    {
        user: {
            userName: '~~testAdmin',
            canLogin: true,
            canUpdate: true,
            isAdmin: true
        },
        password: 'p@ssw0rd'
    }
];
export default config;
