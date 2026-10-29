import { calculate } from './api'

export const OPERATIONS: Record<string, string> = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
  '^': 'power',
}

export async function evaluate(tokens: string[]): Promise<number> {
  let remaining = await applyRightToLeft(tokens, ['^'])
  remaining = await applyLeftToRight(remaining, ['*', '/'])
  remaining = await applyLeftToRight(remaining, ['+', '-'])
  return toNumber(remaining[0])
}

async function applyRightToLeft(tokens: string[], operators: string[]) {
  const result = [...tokens]
  for (let i = result.length - 2; i > 0; i -= 2) {
    if (operators.includes(result[i])) {
      result.splice(i - 1, 3, await apply(result[i - 1], result[i], result[i + 1]))
    }
  }
  return result
}

async function applyLeftToRight(tokens: string[], operators: string[]) {
  const result = [...tokens]
  let i = 1
  while (i < result.length) {
    if (operators.includes(result[i])) {
      result.splice(i - 1, 3, await apply(result[i - 1], result[i], result[i + 1]))
    } else {
      i += 2
    }
  }
  return result
}

async function apply(leftToken: string, operator: string, rightToken: string) {
  const left = await toNumber(leftToken)
  const right = await toNumber(rightToken)
  const isPercentageOfLeft = rightToken.endsWith('%') && (operator === '+' || operator === '-')

  const operand = isPercentageOfLeft ? await calculate('multiply', left, right) : right
  return String(await calculate(OPERATIONS[operator], left, operand))
}

async function toNumber(token: string) {
  return token.endsWith('%') ? calculate('percentage', Number(token.slice(0, -1))) : Number(token)
}
