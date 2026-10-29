package com.brunocordova.calculator.domain;

import java.math.BigDecimal;
import java.math.MathContext;

import org.springframework.stereotype.Component;

@Component
public class SquareRoot implements Operation {

    @Override
    public String name() {
        return "sqrt";
    }

    @Override
    public boolean isUnary() {
        return true;
    }

    @Override
    public BigDecimal apply(BigDecimal a, BigDecimal b) {
        if (a.signum() < 0) {
            throw new CalculationException("Square root of a negative number is not allowed");
        }
        return a.sqrt(MathContext.DECIMAL64);
    }
}
