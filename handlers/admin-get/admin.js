export function handler(request, response) {
    response.render('admin', {
        headTitle: 'Administrator Settings'
    });
}
export default handler;
