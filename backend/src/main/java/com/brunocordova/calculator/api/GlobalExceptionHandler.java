package com.brunocordova.calculator.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.brunocordova.calculator.domain.CalculationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({CalculationException.class, ArithmeticException.class})
    public ProblemDetail handleCalculationError(RuntimeException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
    }
}
