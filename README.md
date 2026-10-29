# Calculator

A full-stack calculator: a **React + TypeScript** frontend with a macOS-style keypad that consumes a **Java 21 + Spring Boot** REST API.

- Supported operations: addition, subtraction, multiplication, division, exponentiation, square root and percentage.
- Expressions such as `50 − 20 × 10` are evaluated with the standard operator precedence.
- It can be used with the mouse or the physical keyboard.

## Project structure

```
backend/                      Spring Boot REST API
  src/main/java/.../calculator
    domain/                   Operation interface, one class per operation, CalculationException
    application/              CalculatorService (finds the operation and validates operands)
    api/                      Controller, request/response records, error handler
frontend/                     React app (Vite)
  src/
    Calculator.tsx            Keypad UI and keyboard support
    useCalculator.ts          Handles each key press and builds the expression
    evaluate.ts               Evaluates the expression with operator precedence using the API
    api.ts                    HTTP client for the backend
Dockerfile                    Builds and runs frontend + backend in a single container
```

## Requirements

- Java 21 (Maven is not required, the project ships with the Maven Wrapper)
- Node.js 22.12+
- Docker (optional)

## Running

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API runs on http://localhost:8080.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` requests to the backend on port 8080, so start the backend first.

Keyboard shortcuts: digits, `.` or `,`, `+ - * / ^`, `%`, `Enter` or `=`, `Backspace` and `Esc` (AC).

### Docker (frontend + backend together)

```bash
docker build -t calculator .
docker run -p 8080:8080 calculator
```

Open http://localhost:8080. The React build is served by Spring Boot as static files, so both run in one container under the same origin.

## Tests and coverage

| Layer    | Command                             | Coverage report                         | Line coverage |
|----------|-------------------------------------|-----------------------------------------|---------------|
| Backend  | `cd backend && ./mvnw test`         | `backend/target/site/jacoco/index.html` | 96% (only `main()` is not covered) |
| Frontend | `cd frontend && npm run coverage`   | `frontend/coverage/index.html`          | 99%           |

- **Backend**: `CalculatorServiceTest` covers every operation and edge case (division by zero, negative square root, fractional and negative exponents, missing operand, unsupported operation). `CalculatorControllerTest` covers the HTTP layer (success, calculation error, invalid JSON).
- **Frontend**: `evaluate.test.ts` covers operator precedence, right-to-left powers and both percentage behaviors. `Calculator.test.tsx` covers the user flows: typing with keypad and keyboard, editing, square root, evaluating, display rounding, API errors, results too large and server unreachable.

## API

### `POST /api/calculator/{operation}`

| Operation    | Description             | Body                  |
|--------------|-------------------------|-----------------------|
| `add`        | a + b                   | `{"a": 2, "b": 3}`    |
| `subtract`   | a − b                   | `{"a": 10, "b": 4}`   |
| `multiply`   | a × b                   | `{"a": 2.5, "b": 4}`  |
| `divide`     | a ÷ b                   | `{"a": 1, "b": 3}`    |
| `percentage` | a ÷ 100                 | `{"a": 15}`           |
| `power`      | a ^ b                   | `{"a": 2, "b": 10}`   |
| `sqrt`       | √a                      | `{"a": 9}`            |

**Success** `200 OK`

```bash
curl -X POST http://localhost:8080/api/calculator/add \
  -H "Content-Type: application/json" \
  -d '{"a": 0.1, "b": 0.2}'
```

```json
{"result": 0.3}
```

```bash
curl -X POST http://localhost:8080/api/calculator/percentage \
  -H "Content-Type: application/json" \
  -d '{"a": 15}'
```

```json
{"result": 0.15}
```

**Error** `400 Bad Request` ([RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457))

```bash
curl -X POST http://localhost:8080/api/calculator/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 1, "b": 0}'
```

```json
{
  "title": "Bad Request",
  "status": 400,
  "detail": "Division by zero is not allowed",
  "instance": "/api/calculator/divide"
}
```

Other errors use the same format: `Square root of a negative number is not allowed`, `Fractional power of a negative number is not allowed`, `Result is too large`, `Missing operand for operation: add`, `Unsupported operation: modulo`, and `Failed to read request` for invalid JSON.

## Design decisions

- **Java instead of Go.** Go is preferred, but Java is the stack I know best, so I could focus on design and correctness within the time box. The design maps directly to Go: an interface, one type per operation and a map lookup.
- **Strategy pattern.** Each operation implements the `Operation` interface. Spring injects all implementations into `CalculatorService`, which indexes them by name. Adding an operation means adding one class, with no `switch` or `if` chains to change (Open/Closed Principle).
- **SOLID and layers.** Each class has one responsibility. The controller depends on the service, and the service depends on the `Operation` abstraction, not on concrete classes (Dependency Inversion). Dependencies point inward: `api → application → domain`.
- **`BigDecimal` instead of `double`.** Floating point returns `0.1 + 0.2 = 0.30000000000000004`. With `BigDecimal` the result is exactly `0.3`, which matters for financial software. Division and square root are rounded to 16 significant digits (`MathContext.DECIMAL64`), about what a JavaScript number can represent.
- **One endpoint, operation in the path.** `POST /api/calculator/{operation}` keeps a single, uniform contract. `POST` is used because the operands are sent in the body.
- **Single error format.** All calculation errors return `400` with a Problem Details body, so the frontend only needs to read `detail`.
- **macOS-style keypad.** A keypad is more intuitive than separate input fields: the user types the whole expression and sees it on the display (`*` is shown as `×`, `/` as `÷`). Every button is identified by its keyboard key, so clicks and key presses go through the same `press` function. The optional operations (`xʸ` and `√x`) are in an extra row on top of the macOS layout.
- **Operator precedence.** The frontend keeps the expression as a list of tokens (`["50", "-", "20", "*", "10"]`), so no string parsing is needed. On `=`, `evaluate.ts` makes one pass per precedence level and replaces each `left operator right` with its result: first `^` from right to left (`2^3^2 = 2^9`), then `×` `÷`, then `+` `−` from left to right. Every arithmetic operation is done by the API (`multiply(20, 10)`, then `subtract(50, 200)`).
- **Guard digit.** The API computes with 16 significant digits and the display rounds results to 15, like physical calculators do, so `1 ÷ 3 × 3` shows `1` instead of `0.9999999999999999`. Only the display is rounded: the full value is kept for the next calculation, so `1 ÷ 3 =` followed by `× 3 =` also shows `1`.
- **Validation split.** The keypad only accepts valid input: one decimal point per number, at most 15 characters, and no two operators in a row. Business rules (division by zero, etc.) live only in the backend and their messages are shown on the display.
- **Simple frontend.** Local state in a custom hook, with the HTTP call isolated in `api.ts`. No state management or UI libraries. The only extra dependency is `lucide-react` for the SVG icons, so the symbols are centered and consistent.

## Assumptions

- The API's `percentage` converts a number to a fraction (`15` → `0.15`). The UI follows the macOS calculator: after `+` or `−`, a percentage is taken of the left side (`100 + 10% = 110`), and after `×` or `÷` it is a fraction (`200 × 15% = 30`).
- `√x` applies immediately to the current number, like on the macOS scientific calculator.
- `power` is exact with `BigDecimal` for integer exponents. Fractional exponents (`4 ^ 0.5 = 2`) fall back to `double`, because `BigDecimal` has no fractional power.
- Results larger than a JavaScript number can hold show `Result is too large`.
- Numbers can be typed with up to 15 characters.
- When the 16th significant digit is exactly 5, the 15th digit may round down (`√2` shows `1.41421356237309`), because the browser stores the value as a binary floating point number.

## AI usage

This project was built with the help of Claude Code. The prompts, condensed into the three phases of the work, are in [PROMPTS.md](PROMPTS.md).
