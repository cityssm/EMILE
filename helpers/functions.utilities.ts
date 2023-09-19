export async function delay(timeMillis: number): Promise<unknown> {
  return await new Promise((resolve) => setTimeout(resolve, timeMillis))
}
