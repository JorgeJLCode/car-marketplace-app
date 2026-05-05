package com.carsales.car_sales.service;

import com.carsales.car_sales.dto.AuthResponseDto;
import com.carsales.car_sales.dto.LoginRequestDto;
import com.carsales.car_sales.dto.RegisterRequestDto;
import com.carsales.car_sales.entity.User;
import com.carsales.car_sales.repository.UserRepository;
import com.carsales.car_sales.security.CustomUserDetails;
import com.carsales.car_sales.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_ShouldReturnToken_WhenUserIsNew() {
        // Arrange
        RegisterRequestDto request = new RegisterRequestDto();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtTokenProvider.generateToken(any(CustomUserDetails.class))).thenReturn("fake-jwt-token");

        // Act
        AuthResponseDto response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("fake-jwt-token", response.getToken());
        assertEquals("Usuario registrado exitosamente", response.getMessage());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailExists() {
        // Arrange
        RegisterRequestDto request = new RegisterRequestDto();
        request.setEmail("test@example.com");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(new User()));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        // Arrange
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword("encoded-password");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(any(CustomUserDetails.class))).thenReturn("fake-jwt-token");

        // Act
        AuthResponseDto response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("fake-jwt-token", response.getToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
