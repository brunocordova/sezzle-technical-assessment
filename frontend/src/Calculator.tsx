import { Delete, Divide, Equal, Minus, Percent, Plus, X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useCalculator } from './useCalculator'

type CalculatorButton = {
  label: string
  key: string
  variant: 'function' | 'digit' | 'operator'
  icon?: ReactNode
  wide?: boolean
}

const ICON_SIZE = 28

const buttons: CalculatorButton[] = [
  { label: 'Power', key: '^', variant: 'function', icon: 'xʸ', wide: true },
  { label: 'Square root', key: '√', variant: 'function', icon: '√x', wide: true },

  { label: 'Delete', key: 'Backspace', variant: 'function', icon: <Delete size={ICON_SIZE} /> },
  { label: 'AC', key: 'Escape', variant: 'function' },
  { label: 'Percent', key: '%', variant: 'function', icon: <Percent size={ICON_SIZE} /> },
  { label: 'Divide', key: '/', variant: 'operator', icon: <Divide size={ICON_SIZE} /> },

  { label: '7', key: '7', variant: 'digit' },
  { label: '8', key: '8', variant: 'digit' },
  { label: '9', key: '9', variant: 'digit' },
  { label: 'Multiply', key: '*', variant: 'operator', icon: <X size={ICON_SIZE} /> },

  { label: '4', key: '4', variant: 'digit' },
  { label: '5', key: '5', variant: 'digit' },
  { label: '6', key: '6', variant: 'digit' },
  { label: 'Subtract', key: '-', variant: 'operator', icon: <Minus size={ICON_SIZE} /> },

  { label: '1', key: '1', variant: 'digit' },
  { label: '2', key: '2', variant: 'digit' },
  { label: '3', key: '3', variant: 'digit' },
  { label: 'Add', key: '+', variant: 'operator', icon: <Plus size={ICON_SIZE} /> },

  { label: 'Change sign', key: '±', variant: 'digit', icon: '⁺∕₋' },
  { label: '0', key: '0', variant: 'digit' },
  { label: '.', key: '.', variant: 'digit' },
  { label: 'Equals', key: 'Enter', variant: 'operator', icon: <Equal size={ICON_SIZE} /> },
]

const keyboardAliases: Record<string, string> = {
  '=': 'Enter',
  ',': '.',
}

export default function Calculator() {
  const { expression, history, press } = useCalculator()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = keyboardAliases[event.key] ?? event.key
      if (event.metaKey || event.ctrlKey || !buttons.some((button) => button.key === key)) return

      event.preventDefault()
      press(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [press])

  return (
    <main className="calculator" aria-label="Calculator">
      <div className="window-controls" aria-hidden="true">
        <span className="close" />
        <span className="minimize" />
        <span className="maximize" />
      </div>

      <p className="history">{history}</p>
      <output className="display" style={{ fontSize: fontSize(expression) }}>
        {expression}
      </output>

      <div className="keypad">
        {buttons.map((button) => (
          <button
            key={button.key}
            type="button"
            aria-label={button.label}
            className={button.wide ? `${button.variant} wide` : button.variant}
            onClick={() => press(button.key)}
          >
            {button.icon ?? button.label}
          </button>
        ))}
      </div>
    </main>
  )
}

function fontSize(text: string) {
  return `${Math.min(3, Math.max(1.5, 24 / text.length))}rem`
}
