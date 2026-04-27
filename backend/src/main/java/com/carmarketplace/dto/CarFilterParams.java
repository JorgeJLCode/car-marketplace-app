package com.carmarketplace.dto;

import lombok.Data;

@Data
public class CarFilterParams {
    private String make;
    private String model;
    private Integer minYear;
    private Integer maxYear;
    private Double minPrice;
    private Double maxPrice;
    private String fuelType;
    private String transmission;
    private String search;
    private int page = 0;
    private int size = 10;
    private String sortBy = "createdAt";
    private String sortDir = "desc";
}
