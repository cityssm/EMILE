export function handler(request, response) {
    response.render('admin-tables', {
        headTitle: 'Table Maintenance'
    });
}
export default handler;
