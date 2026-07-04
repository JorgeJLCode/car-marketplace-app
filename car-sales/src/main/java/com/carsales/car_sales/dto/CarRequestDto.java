package com.carsales.car_sales.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CarRequestDto {

    @NotBlank(message = "La marca es obligatoria")
    private String brand;

    @NotBlank(message = "El modelo es obligatorio")
    private String model;

    @NotNull(message = "El año es obligatorio")
    @Min(value = 1886, message = "El año no es válido") // Validación: 1886 es el año del primer automóvil moderno
    private Integer year;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0") // Validación: El precio no puede ser 0 o negativo
    private BigDecimal price;

    @NotNull(message = "El kilometraje es obligatorio")
    @Min(value = 0, message = "El kilometraje no puede ser negativo")
    private Integer mileage;

    private String imageUrl;
}
