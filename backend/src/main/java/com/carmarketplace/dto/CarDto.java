package com.carmarketplace.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CarDto {
    @NotBlank
    private String make;
    @NotBlank
    private String model;
    @Min(1886)
    @Max(2100)
    private Integer year;
    @Positive
    private Double price;
    @Min(0)
    private Integer mileage;
    private String fuelType;
    private String transmission;
    private String description;
    private String imageUrl;
}
