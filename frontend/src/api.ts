export class ApiError extends Error {}

export async function calculate(operation: string, a: number, b?: number): Promise<number> {
  const response = await fetch(`/api/calculator/${operation}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ a, b }),
  })
  const body = await response.json()

  if (!response.ok) {
    throw new ApiError(body.detail)
  }
  if (!Number.isFinite(body.result)) {
    throw new ApiError('Result is too large')
  }
  return body.result
}
