package com.brunocordova.calculator.domain;

import java.math.BigDecimal;
import java.math.MathContext;

import org.springframework.stereotype.Component;

@Component
public class Power implements Operation {

    private static final BigDecimal MAX_EXACT_EXPONENT = BigDecimal.valueOf(999_999_999);

    @Override
    public String name() {
        return "power";
    }

    @Override
    public BigDecimal apply(BigDecimal a, BigDecimal b) {
        if (a.signum() == 0 && b.signum() < 0) {
            throw new CalculationException("Division by zero is not allowed");
        }
        if (isInteger(b) && b.abs().compareTo(MAX_EXACT_EXPONENT) <= 0) {
            return a.pow(b.intValueExact(), MathContext.DECIMAL64);
        }

        double result = Math.pow(a.doubleValue(), b.doubleValue());
        if (Double.isNaN(result)) {
            throw new CalculationException("Fractional power of a negative number is not allowed");
        }
        if (Double.isInfinite(result)) {
            throw new CalculationException("Result is too large");
        }
        return new BigDecimal(result, MathContext.DECIMAL64);
    }

    private static boolean isInteger(BigDecimal value) {
        return value.stripTrailingZeros().scale() <= 0;
    }
}
