package com.carmarketplace.repository;

import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.Favorite;
import com.carmarketplace.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    @EntityGraph(attributePaths = {"car", "user"})
    List<Favorite> findByUser(User user);

    boolean existsByUserAndCar(User user, Car car);

    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.user = :user AND f.car = :car")
    void deleteByUserAndCar(@Param("user") User user, @Param("car") Car car);
}
