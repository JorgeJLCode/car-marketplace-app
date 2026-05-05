package com.carsales.car_sales.service;

import com.carsales.car_sales.dto.CarFilterDto;
import com.carsales.car_sales.dto.CarRequestDto;
import com.carsales.car_sales.dto.CarResponseDto;
import com.carsales.car_sales.entity.Car;
import com.carsales.car_sales.repository.CarRepository;
import com.carsales.car_sales.repository.CarSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
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
                .orElseThrow(() -> {
                    // LOGGING DECISION [ERROR]: Una petición que llega aquí y falla implica que se solicitó un recurso inexistente.
                    log.error("Fallo al obtener coche: no se encontró vehículo con ID [{}]", id);
                    return new EntityNotFoundException("Coche no encontrado con id: " + id);
                });
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
        
        Car savedCar = carRepository.save(car);
        // LOGGING DECISION [INFO]: Acción administrativa importante completada.
        log.info("Admin creó un nuevo vehículo: [{}] {} {} (ID: {})", 
                 savedCar.getBrand(), savedCar.getModel(), savedCar.getYear(), savedCar.getId());
                 
        return toDto(savedCar);
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    public CarResponseDto update(Long id, CarRequestDto request) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Admin intentó actualizar un vehículo inexistente (ID: [{}])", id);
                    return new EntityNotFoundException("Coche no encontrado con id: " + id);
                });

        car.setBrand(request.getBrand());
        car.setModel(request.getModel());
        car.setYear(request.getYear());
        car.setPrice(request.getPrice());
        car.setMileage(request.getMileage());

        Car updatedCar = carRepository.save(car);
        log.info("Admin actualizó exitosamente el vehículo ID [{}]", id);
        
        return toDto(updatedCar);
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    public void delete(Long id) {
        if (!carRepository.existsById(id)) {
            log.warn("Admin intentó eliminar un vehículo inexistente (ID: [{}])", id);
            throw new EntityNotFoundException("Coche no encontrado con id: " + id);
        }
        carRepository.deleteById(id);
        log.info("Admin eliminó exitosamente el vehículo ID [{}]", id);
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

