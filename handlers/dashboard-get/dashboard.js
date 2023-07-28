export function handler(request, response) {
    response.render('dashboard', {
        headTitle: 'Dashboard'
    });
}
export default handler;
