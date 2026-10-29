package com.brunocordova.calculator.domain;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

@Component
public class Multiplication implements Operation {

    @Override
    public String name() {
        return "multiply";
    }

    @Override
    public BigDecimal apply(BigDecimal a, BigDecimal b) {
        return a.multiply(b);
    }
}
