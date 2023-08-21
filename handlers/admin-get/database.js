export function handler(request, response) {
    response.render('admin-database', {
        headTitle: 'Database Maintenance'
    });
}
export default handler;
