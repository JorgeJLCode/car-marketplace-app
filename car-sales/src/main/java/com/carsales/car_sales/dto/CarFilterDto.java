package com.carsales.car_sales.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Parámetros de búsqueda y filtrado para el endpoint GET /api/cars.
 * Todos los campos son opcionales; si no se envían, no se aplica ese filtro.
 */
@Data
public class CarFilterDto {

    /** Texto libre: busca en marca o modelo (case-insensitive) */
    private String q;

    /** Marca exacta */
    private String brand;

    /** Precio mínimo */
    private BigDecimal minPrice;

    /** Precio máximo */
    private BigDecimal maxPrice;

    /** Año mínimo */
    private Integer minYear;

    /** Año máximo */
    private Integer maxYear;
}
