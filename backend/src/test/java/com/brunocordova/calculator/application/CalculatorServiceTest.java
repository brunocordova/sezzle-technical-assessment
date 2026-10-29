package com.brunocordova.calculator.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import com.brunocordova.calculator.domain.Addition;
import com.brunocordova.calculator.domain.CalculationException;
import com.brunocordova.calculator.domain.Division;
import com.brunocordova.calculator.domain.Multiplication;
import com.brunocordova.calculator.domain.Percentage;
import com.brunocordova.calculator.domain.Power;
import com.brunocordova.calculator.domain.SquareRoot;
import com.brunocordova.calculator.domain.Subtraction;

class CalculatorServiceTest {

    private final CalculatorService calculatorService = new CalculatorService(List.of(
            new Addition(),
            new Subtraction(),
            new Multiplication(),
            new Division(),
            new Power(),
            new SquareRoot(),
            new Percentage()));

    @ParameterizedTest
    @CsvSource({
            "add,        2,   3,   5",
            "add,        0.1, 0.2, 0.3",
            "subtract,   10,  4,   6",
            "multiply,   2.5, 4,   10",
            "divide,     10,  4,   2.5",
            "divide,     1,   3,   0.3333333333333333",
            "power,      2,   10,  1024",
            "power,      2,   -2,  0.25",
            "power,      4,   0.5, 2",
            "power,      2,   0.5, 1.414213562373095",
            "power,      1,   9999999999, 1",
            "percentage, 15,  ,    0.15",
            "sqrt,       16,  ,    4"
    })
    void calculatesOperation(String operation, BigDecimal a, BigDecimal b, BigDecimal expected) {
        assertThat(calculatorService.calculate(operation, a, b)).isEqualByComparingTo(expected);
    }

    @ParameterizedTest
    @CsvSource({
            "divide, 1,  0,   Division by zero is not allowed",
            "sqrt,   -4, ,    Square root of a negative number is not allowed",
            "power,  -8, 0.5, Fractional power of a negative number is not allowed",
            "power,  10, 400.5, Result is too large",
            "power,  2,  9999999999, Result is too large",
            "power,  0,  -1,  Division by zero is not allowed",
            "add,    1,  ,    Missing operand for operation: add",
            "modulo, 1,  2,   Unsupported operation: modulo"
    })
    void rejectsInvalidCalculation(String operation, BigDecimal a, BigDecimal b, String message) {
        assertThatThrownBy(() -> calculatorService.calculate(operation, a, b))
                .isInstanceOf(CalculationException.class)
                .hasMessage(message);
    }

    @Test
    void rejectsMissingFirstOperand() {
        assertThatThrownBy(() -> calculatorService.calculate("sqrt", null, null))
                .isInstanceOf(CalculationException.class)
                .hasMessage("Missing operand for operation: sqrt");
    }
}
