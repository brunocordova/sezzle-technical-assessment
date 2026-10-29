import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Calculator from './Calculator'

function mockResults(...results: number[]) {
  for (const result of results) {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result })))
  }
}

function request(index: number) {
  const [url, init] = vi.mocked(fetch).mock.calls[index]
  return { url, body: JSON.parse(init?.body as string) }
}

async function click(...labels: string[]) {
  for (const label of labels) {
    await userEvent.click(screen.getByRole('button', { name: label }))
  }
}

async function expectDisplay(text: string) {
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe(text))
}

describe('Calculator', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('shows the expression with calculator symbols while typing', async () => {
    render(<Calculator />)

    await userEvent.keyboard('50-20*10/2^3')

    await expectDisplay('50−20×10÷2^3')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('evaluates the expression respecting operator precedence', async () => {
    mockResults(200, -150)
    render(<Calculator />)

    await userEvent.keyboard('50-20*10{Enter}')

    await expectDisplay('-150')
    expect(screen.getByText('50−20×10')).toBeInTheDocument()
    expect(request(0)).toEqual({ url: '/api/calculator/multiply', body: { a: 20, b: 10 } })
    expect(request(1)).toEqual({ url: '/api/calculator/subtract', body: { a: 50, b: 200 } })
  })

  it('works with the keypad buttons', async () => {
    mockResults(2)
    render(<Calculator />)

    await click('6', 'Divide', '3', 'Equals')

    await expectDisplay('2')
  })

  it('calculates the square root of the current number', async () => {
    mockResults(3)
    render(<Calculator />)

    await click('1', 'Add', '9', 'Square root')

    await expectDisplay('1+3')
    expect(request(0)).toEqual({ url: '/api/calculator/sqrt', body: { a: 9 } })
  })

  it('edits the expression', async () => {
    render(<Calculator />)

    await click('1', '2', '.', '5', 'Delete', 'Change sign', 'Add', 'Multiply', '3', 'Percent')
    await expectDisplay('-12.×3%')

    await click('AC')
    await expectDisplay('0')
  })

  it('rounds results on the display but keeps full precision for the next calculation', async () => {
    mockResults(0.3333333333333333, 0.9999999999999999)
    render(<Calculator />)

    await userEvent.keyboard('1/3{Enter}')
    await expectDisplay('0.333333333333333')

    await userEvent.keyboard('*3{Enter}')
    await expectDisplay('1')
    expect(request(1).body).toEqual({ a: 0.3333333333333333, b: 3 })
  })

  it('starts a new expression when typing a number after a result', async () => {
    mockResults(5)
    render(<Calculator />)

    await userEvent.keyboard('2+3{Enter}')
    await expectDisplay('5')

    await userEvent.keyboard('7')
    await expectDisplay('7')
  })

  it('shows the error returned by the API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Division by zero is not allowed' }), { status: 400 }),
    )
    render(<Calculator />)

    await userEvent.keyboard('1/0{Enter}')

    expect(await screen.findByText('Division by zero is not allowed')).toBeInTheDocument()
    await expectDisplay('0')
  })

  it('shows an error when the result is too large', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{"result": 1e400}'))
    render(<Calculator />)

    await userEvent.keyboard('2^9999{Enter}')

    expect(await screen.findByText('Result is too large')).toBeInTheDocument()
  })

  it('shows a message when the server is unreachable', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))
    render(<Calculator />)

    await userEvent.keyboard('1+2{Enter}')

    expect(await screen.findByText('Unable to reach the server')).toBeInTheDocument()
  })
})
