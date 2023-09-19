import { cleanupDatabase } from '../../database/cleanupDatabase.js';
export async function handler(request, response) {
    const deleteCount = await cleanupDatabase(request.session.user);
    response.json({
        success: true,
        deleteCount
    });
}
export default handler;
