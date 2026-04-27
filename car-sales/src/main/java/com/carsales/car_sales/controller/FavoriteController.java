package com.carsales.car_sales.controller;

import com.carsales.car_sales.dto.FavoriteResponseDto;
import com.carsales.car_sales.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorites", description = "Gestión de coches favoritos del usuario autenticado")
@SecurityRequirement(name = "bearerAuth")
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * POST /api/favorites/{carId}
     * Añade el coche al listado de favoritos del usuario actual.
     * Devuelve 409 si el coche ya está en favoritos.
     */
    @PostMapping("/{carId}")
    @Operation(summary = "Añadir coche a favoritos")
    public ResponseEntity<FavoriteResponseDto> addFavorite(
            @PathVariable Long carId,
            Authentication authentication) {

        FavoriteResponseDto response = favoriteService.addFavorite(carId, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * DELETE /api/favorites/{carId}
     * Elimina el coche del listado de favoritos del usuario actual.
     * Devuelve 204 No Content si se eliminó correctamente.
     */
    @DeleteMapping("/{carId}")
    @Operation(summary = "Eliminar coche de favoritos")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long carId,
            Authentication authentication) {

        favoriteService.removeFavorite(carId, authentication);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/favorites
     * Lista todos los coches favoritos del usuario actual.
     */
    @GetMapping
    @Operation(summary = "Listar mis favoritos")
    public ResponseEntity<List<FavoriteResponseDto>> getFavorites(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getFavorites(authentication));
    }
}
