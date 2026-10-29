package com.brunocordova.calculator.api;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.brunocordova.calculator.application.CalculatorService;

@RestController
@RequestMapping("/api/calculator")
public class CalculatorController {

    private final CalculatorService calculatorService;

    public CalculatorController(CalculatorService calculatorService) {
        this.calculatorService = calculatorService;
    }

    @PostMapping("/{operation}")
    public CalculationResponse calculate(@PathVariable String operation, @RequestBody CalculationRequest request) {
        return new CalculationResponse(calculatorService.calculate(operation, request.a(), request.b()));
    }
}
