export function handler(request, response) {
    response.render('admin', {
        headTitle: 'Administrator Settings',
        menuItem: 'Settings'
    });
}
export default handler;
