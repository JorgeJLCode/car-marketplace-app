package com.carsales.car_sales.controller;

import com.carsales.car_sales.dto.AuthResponseDto;
import com.carsales.car_sales.dto.LoginRequestDto;
import com.carsales.car_sales.dto.RegisterRequestDto;
import com.carsales.car_sales.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new AuthResponseDto(null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new AuthResponseDto(null, "Credenciales incorrectas"));
        }
    }
}
