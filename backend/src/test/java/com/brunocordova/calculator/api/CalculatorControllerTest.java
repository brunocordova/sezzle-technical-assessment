package com.brunocordova.calculator.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.brunocordova.calculator.application.CalculatorService;
import com.brunocordova.calculator.domain.CalculationException;

@WebMvcTest(CalculatorController.class)
class CalculatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CalculatorService calculatorService;

    @Test
    void returnsResult() throws Exception {
        when(calculatorService.calculate("add", new BigDecimal("2"), new BigDecimal("3")))
                .thenReturn(new BigDecimal("5"));

        mockMvc.perform(post("/api/calculator/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 2, \"b\": 3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(5));
    }

    @Test
    void returnsBadRequestWhenCalculationFails() throws Exception {
        when(calculatorService.calculate("divide", new BigDecimal("1"), new BigDecimal("0")))
                .thenThrow(new CalculationException("Division by zero is not allowed"));

        mockMvc.perform(post("/api/calculator/divide")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 1, \"b\": 0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Division by zero is not allowed"));
    }

    @Test
    void returnsBadRequestForInvalidJson() throws Exception {
        mockMvc.perform(post("/api/calculator/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": \"abc\"}"))
                .andExpect(status().isBadRequest());
    }
}
