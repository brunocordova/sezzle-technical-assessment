package com.brunocordova.calculator.domain;

import java.math.BigDecimal;
import java.math.MathContext;

import org.springframework.stereotype.Component;

@Component
public class Division implements Operation {

    @Override
    public String name() {
        return "divide";
    }

    @Override
    public BigDecimal apply(BigDecimal a, BigDecimal b) {
        if (b.signum() == 0) {
            throw new CalculationException("Division by zero is not allowed");
        }
        return a.divide(b, MathContext.DECIMAL64);
    }
}
