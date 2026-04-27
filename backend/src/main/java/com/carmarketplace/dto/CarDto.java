package com.carmarketplace.dto;

import lombok.Data;

@Data
public class CarDto {
    private String make;
    private String model;
    private Integer year;
    private Double price;
    private Integer mileage;
    private String fuelType;
    private String transmission;
    private String description;
    private String imageUrl;
}
