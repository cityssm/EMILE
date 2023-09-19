export async function delay(timeMillis) {
    return await new Promise((resolve) => setTimeout(resolve, timeMillis));
}
