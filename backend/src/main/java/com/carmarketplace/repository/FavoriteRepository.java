package com.carmarketplace.repository;

import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.Favorite;
import com.carmarketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
    boolean existsByUserAndCar(User user, Car car);
    void deleteByUserAndCar(User user, Car car);
}
