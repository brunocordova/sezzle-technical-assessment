package com.brunocordova.calculator.domain;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

@Component
public class Addition implements Operation {

    @Override
    public String name() {
        return "add";
    }

    @Override
    public BigDecimal apply(BigDecimal a, BigDecimal b) {
        return a.add(b);
    }
}
