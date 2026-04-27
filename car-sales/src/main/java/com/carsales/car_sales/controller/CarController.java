package com.carsales.car_sales.controller;

import com.carsales.car_sales.dto.CarFilterDto;
import com.carsales.car_sales.dto.CarRequestDto;
import com.carsales.car_sales.dto.CarResponseDto;
import com.carsales.car_sales.service.CarService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    // GET /api/cars?q=bmw&brand=BMW&minPrice=10000&maxPrice=50000&minYear=2018&maxYear=2023&page=0&size=10&sort=price,asc
    @GetMapping
    public ResponseEntity<Page<CarResponseDto>> getAll(
            @ParameterObject CarFilterDto filter,
            @ParameterObject @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(carService.findAll(filter, pageable));
    }

    // GET /api/cars/{id}  → Público
    @GetMapping("/{id}")
    public ResponseEntity<CarResponseDto> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(carService.findById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/cars  → Solo ADMIN
    @PostMapping
    public ResponseEntity<CarResponseDto> create(@Valid @RequestBody CarRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(carService.create(request));
    }

    // PUT /api/cars/{id}  → Solo ADMIN
    @PutMapping("/{id}")
    public ResponseEntity<CarResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody CarRequestDto request) {
        try {
            return ResponseEntity.ok(carService.update(id, request));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/cars/{id}  → Solo ADMIN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            carService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
