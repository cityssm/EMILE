import { getEnergyData } from '../../database/getEnergyData.js';
export function handler(request, response) {
    const energyData = getEnergyData(request.body);
    response.json({
        success: true,
        energyData
    });
}
export default handler;
