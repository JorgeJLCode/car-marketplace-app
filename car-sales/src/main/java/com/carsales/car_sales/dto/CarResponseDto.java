package com.carsales.car_sales.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CarResponseDto {
    private Long id;
    private String brand;
    private String model;
    private Integer year;
    private BigDecimal price;
    private Integer mileage;
    private String imageUrl;
}
