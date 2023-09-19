import { getEnergyData } from '../../database/getEnergyData.js';
export async function handler(request, response) {
    const energyData = await getEnergyData(request.body);
    response.json({
        success: true,
        energyData
    });
}
export default handler;
