import { beforeEach, describe, expect, it, vi } from 'vitest'
import { calculate } from './api'
import { evaluate } from './evaluate'

vi.mock('./api', () => ({
  calculate: vi.fn(async (operation: string, a: number, b = 0) => {
    const results: Record<string, number> = {
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: a / b,
      power: a ** b,
      percentage: a / 100,
    }
    return results[operation]
  }),
}))

describe('evaluate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('multiplies and divides before adding and subtracting', async () => {
    expect(await evaluate(['50', '-', '20', '*', '10'])).toBe(-150)
    expect(calculate).toHaveBeenNthCalledWith(1, 'multiply', 20, 10)
    expect(calculate).toHaveBeenNthCalledWith(2, 'subtract', 50, 200)
  })

  it('applies powers before any other operation', async () => {
    expect(await evaluate(['2', '*', '3', '^', '2'])).toBe(18)
    expect(calculate).toHaveBeenNthCalledWith(1, 'power', 3, 2)
    expect(calculate).toHaveBeenNthCalledWith(2, 'multiply', 2, 9)
  })

  it('evaluates powers from right to left', async () => {
    expect(await evaluate(['2', '^', '3', '^', '2'])).toBe(512)
  })

  it('evaluates other operators with the same precedence from left to right', async () => {
    expect(await evaluate(['10', '-', '4', '-', '3'])).toBe(3)
    expect(await evaluate(['100', '/', '10', '/', '2'])).toBe(5)
  })

  it('converts a percentage to a fraction when multiplying or dividing', async () => {
    expect(await evaluate(['200', '*', '15%'])).toBe(30)
  })

  it('uses a percentage of the left side when adding or subtracting', async () => {
    expect(await evaluate(['50', '+', '10%'])).toBe(55)
    expect(await evaluate(['200', '-', '10%'])).toBe(180)
  })

  it('returns a single number without calling the API', async () => {
    expect(await evaluate(['42'])).toBe(42)
    expect(calculate).not.toHaveBeenCalled()
  })
})
