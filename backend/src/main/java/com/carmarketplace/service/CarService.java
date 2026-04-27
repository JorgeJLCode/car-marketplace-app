package com.carmarketplace.service;

import com.carmarketplace.dto.CarDto;
import com.carmarketplace.dto.CarFilterParams;
import com.carmarketplace.entity.Car;
import com.carmarketplace.exception.ResourceNotFoundException;
import com.carmarketplace.repository.CarRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarService {

    private final CarRepository carRepository;

    public Page<Car> getAllCars(CarFilterParams params) {
        Sort sort = params.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(params.getSortBy()).ascending()
                : Sort.by(params.getSortBy()).descending();
        Pageable pageable = PageRequest.of(params.getPage(), params.getSize(), sort);

        Specification<Car> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (params.getMake() != null && !params.getMake().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("make")), "%" + params.getMake().toLowerCase() + "%"));
            }
            if (params.getModel() != null && !params.getModel().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("model")), "%" + params.getModel().toLowerCase() + "%"));
            }
            if (params.getMinYear() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("year"), params.getMinYear()));
            }
            if (params.getMaxYear() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("year"), params.getMaxYear()));
            }
            if (params.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), params.getMinPrice()));
            }
            if (params.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), params.getMaxPrice()));
            }
            if (params.getFuelType() != null && !params.getFuelType().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("fuelType")), params.getFuelType().toLowerCase()));
            }
            if (params.getTransmission() != null && !params.getTransmission().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("transmission")), params.getTransmission().toLowerCase()));
            }
            if (params.getSearch() != null && !params.getSearch().isBlank()) {
                String keyword = "%" + params.getSearch().toLowerCase() + "%";
                Predicate makePred = cb.like(cb.lower(root.get("make")), keyword);
                Predicate modelPred = cb.like(cb.lower(root.get("model")), keyword);
                Predicate descPred = cb.like(cb.lower(root.get("description")), keyword);
                predicates.add(cb.or(makePred, modelPred, descPred));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return carRepository.findAll(spec, pageable);
    }

    public Car getCarById(Long id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));
    }

    public Car createCar(CarDto dto) {
        Car car = Car.builder()
                .make(dto.getMake())
                .model(dto.getModel())
                .year(dto.getYear())
                .price(dto.getPrice())
                .mileage(dto.getMileage())
                .fuelType(dto.getFuelType())
                .transmission(dto.getTransmission())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .build();
        Car saved = carRepository.save(car);
        log.info("Car created: {} {}", dto.getMake(), dto.getModel());
        return saved;
    }

    public Car updateCar(Long id, CarDto dto) {
        Car car = getCarById(id);
        car.setMake(dto.getMake());
        car.setModel(dto.getModel());
        car.setYear(dto.getYear());
        car.setPrice(dto.getPrice());
        car.setMileage(dto.getMileage());
        car.setFuelType(dto.getFuelType());
        car.setTransmission(dto.getTransmission());
        car.setDescription(dto.getDescription());
        car.setImageUrl(dto.getImageUrl());
        Car updated = carRepository.save(car);
        log.info("Car updated: id={}", id);
        return updated;
    }

    public void deleteCar(Long id) {
        Car car = getCarById(id);
        carRepository.delete(car);
        log.info("Car deleted: id={}", id);
    }
}
