package com.linstudio.blog.controller;

import com.linstudio.blog.dto.ApiErrorResponse;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("；"));

        return ResponseEntity.badRequest().body(new ApiErrorResponse(HttpStatus.BAD_REQUEST.value(), message));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatus(ResponseStatusException exception) {
        HttpStatus status = exception.getStatus();
        return ResponseEntity.status(status)
            .body(new ApiErrorResponse(status.value(), exception.getReason()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器内部错误"));
    }
}
