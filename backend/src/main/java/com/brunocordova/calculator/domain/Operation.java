package com.brunocordova.calculator.domain;

import java.math.BigDecimal;

public interface Operation {

    String name();

    BigDecimal apply(BigDecimal a, BigDecimal b);

    default boolean isUnary() {
        return false;
    }
}
