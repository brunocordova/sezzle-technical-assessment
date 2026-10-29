# Prompts

I used Claude Code (Claude Opus 5.5) as a pair programmer in an iterative session. The three prompts below condense my instructions from each phase of the work, edited for clarity. The design choices the AI proposed were reviewed and approved by me, and they are documented in the [README](README.md#design-decisions).

## 1. Build

> Build this take-home assignment *(assignment attached)*: a React + TypeScript frontend that consumes a REST backend. Use Java 21 instead of Go, since it is the language I know well enough to explain and defend every line. Apply design patterns, SOLID and a clean layered architecture, but keep everything as simple as possible: small methods, no unnecessary classes, no comments, all code in English. On the frontend, use the latest stable React and avoid extra libraries. Deliver everything the assignment asks for: unit tests with coverage, a Dockerfile and a README.

## 2. User experience

> The two-input form is not intuitive, because nobody uses a calculator that way. Rebuild the UI to look and behave like the macOS Calculator, without the window menu. It must work with the mouse and the physical keyboard. The display must show the whole expression (`*` as `×`, `/` as `÷`), and expressions such as `50 − 20 × 10` must follow operator precedence. Add the optional operations (`xʸ` and `√x`) in an extra row. Polish the details: thin centered icons for the symbols, the system font, correct proportions, and the macOS window buttons (decorative only).

## 3. Verification

> Are all the calculations correct? Double-check with around 200 different calculations an interviewer would try, and fix everything that is wrong. Also remove any IDE warnings.

## What these prompts produced

- **Build:** Strategy pattern with one class per operation, `BigDecimal` arithmetic and RFC 9457 error responses on the backend. A small React app with the HTTP client, the expression evaluation and the UI in separate files.
- **User experience:** a macOS-style keypad with keyboard support and multi-operation expressions evaluated with operator precedence, where every arithmetic step is calculated by the API.
- **Verification:** a 264-case end-to-end check of the real UI against the real backend, compared with an independent oracle (Python `decimal` with 60-digit precision). It found and fixed these issues:
  - `1 ÷ 3 × 3` showed `0.9999999999999999`. The display now rounds to 15 digits while keeping full precision for chained calculations.
  - `50 + 10%` returned `50.1`. It now returns `55`, like the macOS Calculator.
  - `4 ^ 0.5` was rejected. Fractional exponents are now supported.
  - `2 ^ 3 ^ 2` returned `64`. Powers are now evaluated right to left (`512`).
  - Results too large for JavaScript now show `Result is too large` instead of `Infinity`.

The full session log is available on request.
