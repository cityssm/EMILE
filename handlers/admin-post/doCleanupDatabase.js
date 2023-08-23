import { cleanupDatabase } from '../../database/cleanupDatabase.js';
export function handler(request, response) {
    const deleteCount = cleanupDatabase(request.session.user);
    response.json({
        success: true,
        deleteCount
    });
}
export default handler;
