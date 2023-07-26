export function handler(request, response) {
    response.render('reports', {
        headTitle: 'Report Library'
    });
}
export default handler;
