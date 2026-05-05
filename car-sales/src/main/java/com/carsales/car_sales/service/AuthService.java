package com.carsales.car_sales.service;

import com.carsales.car_sales.dto.AuthResponseDto;
import com.carsales.car_sales.dto.LoginRequestDto;
import com.carsales.car_sales.dto.RegisterRequestDto;
import com.carsales.car_sales.entity.User;
import com.carsales.car_sales.repository.UserRepository;
import com.carsales.car_sales.security.CustomUserDetails;
import com.carsales.car_sales.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            // LOGGING DECISION [WARN]: Comportamiento sospechoso (intento de duplicar cuenta). No logueamos contraseñas.
            log.warn("Intento de registro fallido: el email [{}] ya está en uso.", request.getEmail());
            throw new IllegalArgumentException("El email ya está registrado.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.carsales.car_sales.entity.Role.USER) // Asignamos rol por defecto
                .build();

        userRepository.save(user);

        // LOGGING DECISION [INFO]: Acción normal y esperada, útil para métricas.
        log.info("Nuevo usuario registrado con éxito: [{}]", request.getEmail());

        String jwtToken = jwtTokenProvider.generateToken(new CustomUserDetails(user));
        return new AuthResponseDto(jwtToken, "Usuario registrado exitosamente");
    }

    public AuthResponseDto login(LoginRequestDto request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            // LOGGING DECISION [WARN]: Intento fallido de login. No revelamos el error exacto ni la clave por seguridad.
            log.warn("Intento de login fallido para el email [{}]. Causa: credenciales inválidas", request.getEmail());
            throw e;
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        String jwtToken = jwtTokenProvider.generateToken(new CustomUserDetails(user));
        
        // LOGGING DECISION [INFO]: Trazabilidad de acceso exitoso al sistema.
        log.info("Login exitoso para el usuario [{}]", request.getEmail());
        
        return new AuthResponseDto(jwtToken, "Login exitoso");
    }
}
