package com.carsales.car_sales.service;

import com.carsales.car_sales.dto.CarResponseDto;
import com.carsales.car_sales.dto.FavoriteResponseDto;
import com.carsales.car_sales.entity.Car;
import com.carsales.car_sales.entity.Favorite;
import com.carsales.car_sales.entity.User;
import com.carsales.car_sales.repository.CarRepository;
import com.carsales.car_sales.repository.FavoriteRepository;
import com.carsales.car_sales.security.CustomUserDetails;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final CarRepository carRepository;

    /**
     * Añade un coche a favoritos del usuario autenticado.
     * La restricción UNIQUE (user_id, car_id) en la entidad garantiza que no haya duplicados.
     */
    @Transactional
    public FavoriteResponseDto addFavorite(Long carId, Authentication authentication) {
        User currentUser = extractUser(authentication);
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new EntityNotFoundException("Coche no encontrado con id: " + carId));

        if (favoriteRepository.existsByUserIdAndCarId(currentUser.getId(), carId)) {
            throw new IllegalStateException("Este coche ya está en tus favoritos");
        }

        Favorite favorite = Favorite.builder()
                .user(currentUser)
                .car(car)
                .build();

        Favorite saved = favoriteRepository.save(favorite);
        return toDto(saved);
    }

    /**
     * Elimina un coche de favoritos del usuario autenticado.
     */
    @Transactional
    public void removeFavorite(Long carId, Authentication authentication) {
        User currentUser = extractUser(authentication);
        Favorite favorite = favoriteRepository.findByUserIdAndCarId(currentUser.getId(), carId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "El coche con id " + carId + " no está en tus favoritos"));
        favoriteRepository.delete(favorite);
    }

    /**
     * Lista todos los favoritos del usuario autenticado.
     */
    @Transactional(readOnly = true)
    public List<FavoriteResponseDto> getFavorites(Authentication authentication) {
        User currentUser = extractUser(authentication);
        return favoriteRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User extractUser(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }

    private FavoriteResponseDto toDto(Favorite favorite) {
        Car car = favorite.getCar();
        return FavoriteResponseDto.builder()
                .favoriteId(favorite.getId())
                .addedAt(favorite.getCreatedAt())
                .car(CarResponseDto.builder()
                        .id(car.getId())
                        .brand(car.getBrand())
                        .model(car.getModel())
                        .year(car.getYear())
                        .price(car.getPrice())
                        .mileage(car.getMileage())
                        .build())
                .build();
    }
}
