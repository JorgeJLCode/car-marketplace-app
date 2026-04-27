package com.carmarketplace.service;

import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.Favorite;
import com.carmarketplace.entity.User;
import com.carmarketplace.exception.ResourceNotFoundException;
import com.carmarketplace.repository.CarRepository;
import com.carmarketplace.repository.FavoriteRepository;
import com.carmarketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;

    public List<Favorite> getUserFavorites(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return favoriteRepository.findByUser(user);
    }

    public Favorite addFavorite(String username, Long carId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId));

        if (favoriteRepository.existsByUserAndCar(user, car)) {
            throw new IllegalArgumentException("Car already in favorites");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .car(car)
                .build();
        log.info("Favorite added: user={}, carId={}", username, carId);
        return favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String username, Long carId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId));
        favoriteRepository.deleteByUserAndCar(user, car);
        log.info("Favorite removed: user={}, carId={}", username, carId);
    }
}
