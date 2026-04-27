package com.carsales.car_sales.repository;

import com.carsales.car_sales.dto.CarFilterDto;
import com.carsales.car_sales.entity.Car;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class CarSpecification {

    /**
     * Construye una Specification de JPA a partir de los filtros opcionales del DTO.
     * Solo se aplican los filtros cuyo valor NO es nulo/vacío.
     */
    public static Specification<Car> withFilters(CarFilterDto filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // q= búsqueda libre en brand o model
            if (filter.getQ() != null && !filter.getQ().isBlank()) {
                String like = "%" + filter.getQ().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("brand")), like),
                        cb.like(cb.lower(root.get("model")), like)
                ));
            }

            // brand= filtro exacto por marca (case-insensitive)
            if (filter.getBrand() != null && !filter.getBrand().isBlank()) {
                predicates.add(cb.equal(
                        cb.lower(root.get("brand")),
                        filter.getBrand().toLowerCase()
                ));
            }

            // minPrice= / maxPrice= rango de precio
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }

            // minYear= / maxYear= rango de año
            if (filter.getMinYear() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("year"), filter.getMinYear()));
            }
            if (filter.getMaxYear() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("year"), filter.getMaxYear()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
