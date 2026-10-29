package com.brunocordova.calculator.domain;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

@Component
public class Percentage implements Operation {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    @Override
    public String name() {
        return "percentage";
    }

    @Override
    public boolean isUnary() {
        return true;
    }

    @Override
    public BigDecimal apply(BigDecimal a, BigDecimal b) {
        return a.divide(ONE_HUNDRED);
    }
}
