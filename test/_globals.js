import { config } from '../data/config.js';
export const testAdmin = (config.tempUsers ?? []).find((possibleUser) => {
    return possibleUser.user.canLogin && possibleUser.user.isAdmin;
});
if (testAdmin === undefined) {
    console.error('No testAdmin user available.');
}
export const testUpdateUser = (config.tempUsers ?? []).find((possibleUser) => {
    return (possibleUser.user.canLogin &&
        possibleUser.user.canUpdate &&
        !possibleUser.user.isAdmin);
});
if (testUpdateUser === undefined) {
    console.error('No testUpdateUser available');
}
export const testReadOnlyUser = (config.tempUsers ?? []).find((possibleUser) => {
    return (possibleUser.user.canLogin &&
        !possibleUser.user.canUpdate &&
        !possibleUser.user.isAdmin);
});
if (testReadOnlyUser === undefined) {
    console.error('No testReadOnlyUser available');
}
export const portNumber = 7000;
