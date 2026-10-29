package com.brunocordova.calculator.domain;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

@Component
public class Subtraction implements Operation {

    @Override
    public String name() {
        return "subtract";
    }

    @Override
    public BigDecimal apply(BigDecimal a, BigDecimal b) {
        return a.subtract(b);
    }
}
