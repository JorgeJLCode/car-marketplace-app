package com.carmarketplace.controller;

import com.carmarketplace.entity.Favorite;
import com.carmarketplace.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<Favorite>> getUserFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(userDetails.getUsername()));
    }

    @PostMapping("/{carId}")
    public ResponseEntity<Favorite> addFavorite(@AuthenticationPrincipal UserDetails userDetails,
                                                 @PathVariable Long carId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(favoriteService.addFavorite(userDetails.getUsername(), carId));
    }

    @DeleteMapping("/{carId}")
    public ResponseEntity<Void> removeFavorite(@AuthenticationPrincipal UserDetails userDetails,
                                                @PathVariable Long carId) {
        favoriteService.removeFavorite(userDetails.getUsername(), carId);
        return ResponseEntity.noContent().build();
    }
}
