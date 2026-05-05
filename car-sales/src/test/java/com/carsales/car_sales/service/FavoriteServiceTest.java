package com.carsales.car_sales.service;

import com.carsales.car_sales.dto.FavoriteResponseDto;
import com.carsales.car_sales.entity.Car;
import com.carsales.car_sales.entity.Favorite;
import com.carsales.car_sales.entity.User;
import com.carsales.car_sales.repository.CarRepository;
import com.carsales.car_sales.repository.FavoriteRepository;
import com.carsales.car_sales.security.CustomUserDetails;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;
    @Mock
    private CarRepository carRepository;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private FavoriteService favoriteService;

    @Test
    void addFavorite_ShouldSaveAndReturnDto_WhenNotDuplicate() {
        // Arrange
        Long carId = 100L;
        User user = User.builder().id(1L).email("user@test.com").build();
        Car car = Car.builder().id(carId).brand("Audi").model("A4").build();
        CustomUserDetails userDetails = new CustomUserDetails(user);

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(carRepository.findById(carId)).thenReturn(Optional.of(car));
        when(favoriteRepository.existsByUserIdAndCarId(user.getId(), carId)).thenReturn(false);

        Favorite savedFavorite = Favorite.builder()
                .id(10L)
                .user(user)
                .car(car)
                .build();
        when(favoriteRepository.save(any(Favorite.class))).thenReturn(savedFavorite);

        // Act
        FavoriteResponseDto response = favoriteService.addFavorite(carId, authentication);

        // Assert
        assertNotNull(response);
        assertEquals(10L, response.getFavoriteId());
        assertEquals("Audi", response.getCar().getBrand());
        verify(favoriteRepository).save(any(Favorite.class));
    }

    @Test
    void addFavorite_ShouldThrowException_WhenDuplicate() {
        // Arrange
        Long carId = 100L;
        User user = User.builder().id(1L).email("user@test.com").build();
        Car car = Car.builder().id(carId).build();
        CustomUserDetails userDetails = new CustomUserDetails(user);

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(carRepository.findById(carId)).thenReturn(Optional.of(car));
        // Simulate that the favorite already exists
        when(favoriteRepository.existsByUserIdAndCarId(user.getId(), carId)).thenReturn(true);

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            favoriteService.addFavorite(carId, authentication);
        });

        assertEquals("Este coche ya está en tus favoritos", exception.getMessage());
        verify(favoriteRepository, never()).save(any(Favorite.class));
    }
}
