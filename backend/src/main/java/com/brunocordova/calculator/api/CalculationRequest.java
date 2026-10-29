package com.brunocordova.calculator.api;

import java.math.BigDecimal;

public record CalculationRequest(BigDecimal a, BigDecimal b) {
}
