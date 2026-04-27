package com.carsales.car_sales.service;

import com.carsales.car_sales.dto.CarFilterDto;
import com.carsales.car_sales.dto.CarRequestDto;
import com.carsales.car_sales.dto.CarResponseDto;
import com.carsales.car_sales.entity.Car;
import com.carsales.car_sales.repository.CarRepository;
import com.carsales.car_sales.repository.CarSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;

    // ── SEARCH + FILTER + PAGINATE + SORT ────────────────────────────────────
    public Page<CarResponseDto> findAll(CarFilterDto filter, Pageable pageable) {
        return carRepository
                .findAll(CarSpecification.withFilters(filter), pageable)
                .map(this::toDto);
    }

    // ── GET BY ID ────────────────────────────────────────────────────────────
    public CarResponseDto findById(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coche no encontrado con id: " + id));
        return toDto(car);
    }

    // ── CREATE ───────────────────────────────────────────────────────────────
    public CarResponseDto create(CarRequestDto request) {
        Car car = Car.builder()
                .brand(request.getBrand())
                .model(request.getModel())
                .year(request.getYear())
                .price(request.getPrice())
                .mileage(request.getMileage())
                .build();
        return toDto(carRepository.save(car));
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    public CarResponseDto update(Long id, CarRequestDto request) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coche no encontrado con id: " + id));

        car.setBrand(request.getBrand());
        car.setModel(request.getModel());
        car.setYear(request.getYear());
        car.setPrice(request.getPrice());
        car.setMileage(request.getMileage());

        return toDto(carRepository.save(car));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    public void delete(Long id) {
        if (!carRepository.existsById(id)) {
            throw new EntityNotFoundException("Coche no encontrado con id: " + id);
        }
        carRepository.deleteById(id);
    }

    // ── MAPPER ───────────────────────────────────────────────────────────────
    private CarResponseDto toDto(Car car) {
        return CarResponseDto.builder()
                .id(car.getId())
                .brand(car.getBrand())
                .model(car.getModel())
                .year(car.getYear())
                .price(car.getPrice())
                .mileage(car.getMileage())
                .build();
    }
}

