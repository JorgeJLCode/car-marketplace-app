package com.carsales.car_sales.service;

import com.carsales.car_sales.dto.AuthResponseDto;
import com.carsales.car_sales.dto.LoginRequestDto;
import com.carsales.car_sales.dto.RegisterRequestDto;
import com.carsales.car_sales.entity.User;
import com.carsales.car_sales.repository.UserRepository;
import com.carsales.car_sales.security.CustomUserDetails;
import com.carsales.car_sales.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.carsales.car_sales.entity.Role.USER) // Asignamos rol por defecto
                .build();

        userRepository.save(user);

        String jwtToken = jwtTokenProvider.generateToken(new CustomUserDetails(user));
        return new AuthResponseDto(jwtToken, "Usuario registrado exitosamente");
    }

    public AuthResponseDto login(LoginRequestDto request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        String jwtToken = jwtTokenProvider.generateToken(new CustomUserDetails(user));
        return new AuthResponseDto(jwtToken, "Login exitoso");
    }
}
