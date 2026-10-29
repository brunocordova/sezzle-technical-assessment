package com.brunocordova.calculator.application;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.brunocordova.calculator.domain.CalculationException;
import com.brunocordova.calculator.domain.Operation;

@Service
public class CalculatorService {

    private final Map<String, Operation> operations;

    public CalculatorService(List<Operation> operations) {
        this.operations = operations.stream()
                .collect(Collectors.toMap(operation -> operation.name(), operation -> operation));
    }

    public BigDecimal calculate(String operationName, BigDecimal a, BigDecimal b) {
        Operation operation = findOperation(operationName);
        validateOperands(operation, a, b);
        return operation.apply(a, b);
    }

    private Operation findOperation(String name) {
        return Optional.ofNullable(operations.get(name))
                .orElseThrow(() -> new CalculationException("Unsupported operation: " + name));
    }

    private void validateOperands(Operation operation, BigDecimal a, BigDecimal b) {
        if (a == null || (!operation.isUnary() && b == null)) {
            throw new CalculationException("Missing operand for operation: " + operation.name());
        }
    }
}
