import { useState } from 'react'
import { ApiError, calculate } from './api'
import { evaluate, OPERATIONS } from './evaluate'

const SYMBOLS: Record<string, string> = {
  '-': '−',
  '*': '×',
  '/': '÷',
}

const MAX_LENGTH = 15
const SIGNIFICANT_DIGITS = 15

export function useCalculator() {
  const [tokens, setTokens] = useState(['0'])
  const [history, setHistory] = useState('')
  const [showingResult, setShowingResult] = useState(false)
  const [loading, setLoading] = useState(false)

  const last = tokens[tokens.length - 1]
  const lastIsOperator = last in OPERATIONS

  function press(key: string) {
    if (loading) return

    if (/^\d$/.test(key)) inputDigit(key)
    else if (key in OPERATIONS) inputOperator(key)
    else if (key === '.') inputDecimal()
    else if (key === '%') inputPercent()
    else if (key === '√') squareRoot()
    else if (key === '±') toggleSign()
    else if (key === 'Backspace') deleteLast()
    else if (key === 'Escape') clear()
    else if (key === 'Enter') equals()
  }

  function replaceLast(token: string) {
    setTokens([...tokens.slice(0, -1), token])
  }

  function append(token: string) {
    setTokens([...tokens, token])
  }

  function startWith(token: string) {
    setTokens([token])
    setShowingResult(false)
  }

  function inputDigit(digit: string) {
    if (showingResult) startWith(digit)
    else if (lastIsOperator) append(digit)
    else if (last === '0') replaceLast(digit)
    else if (!last.endsWith('%') && last.length < MAX_LENGTH) replaceLast(last + digit)
  }

  function inputDecimal() {
    if (showingResult) startWith('0.')
    else if (lastIsOperator) append('0.')
    else if (!last.includes('.') && !last.endsWith('%')) replaceLast(last + '.')
  }

  function inputOperator(operator: string) {
    setShowingResult(false)
    if (lastIsOperator) replaceLast(operator)
    else append(operator)
  }

  function inputPercent() {
    if (!lastIsOperator && !last.endsWith('%')) replaceLast(last + '%')
  }

  function toggleSign() {
    if (lastIsOperator || last === '0') return
    replaceLast(last.startsWith('-') ? last.slice(1) : '-' + last)
  }

  function deleteLast() {
    if (showingResult) return
    const shortened = last.slice(0, -1)
    if (shortened === '' || shortened === '-') {
      setTokens(tokens.length > 1 ? tokens.slice(0, -1) : ['0'])
    } else {
      replaceLast(shortened)
    }
  }

  function clear() {
    setTokens(['0'])
    setHistory('')
    setShowingResult(false)
  }

  function squareRoot() {
    if (lastIsOperator || last.endsWith('%')) return
    run(async () => replaceLast(String(await calculate('sqrt', Number(last)))))
  }

  function equals() {
    if (lastIsOperator) return
    run(async () => {
      const result = await evaluate(tokens)
      setHistory(format(tokens))
      setTokens([String(result)])
      setShowingResult(true)
    })
  }

  async function run(action: () => Promise<void>) {
    setLoading(true)
    try {
      await action()
    } catch (error) {
      setHistory(error instanceof ApiError ? error.message : 'Unable to reach the server')
      setTokens(['0'])
      setShowingResult(true)
    } finally {
      setLoading(false)
    }
  }

  return { expression: format(tokens), history, press }
}

function format(tokens: string[]) {
  return tokens.map((token) => SYMBOLS[token] ?? formatNumber(token)).join('')
}

function formatNumber(token: string) {
  const value = Number(token)
  if (token.length <= MAX_LENGTH || !Number.isFinite(value)) return token
  return String(Number(value.toPrecision(SIGNIFICANT_DIGITS)))
}
