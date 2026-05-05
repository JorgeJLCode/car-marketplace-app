package com.carsales.car_sales.service;

import com.carsales.car_sales.dto.CarRequestDto;
import com.carsales.car_sales.dto.CarResponseDto;
import com.carsales.car_sales.entity.Car;
import com.carsales.car_sales.repository.CarRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CarServiceTest {

    @Mock
    private CarRepository carRepository;

    @InjectMocks
    private CarService carService;

    @Test
    void create_ShouldReturnCarResponseDto_WhenCarIsCreated() {
        // Arrange
        CarRequestDto request = new CarRequestDto();
        request.setBrand("Tesla");
        request.setModel("Model S");
        request.setYear(2023);
        request.setPrice(new BigDecimal("79999"));
        request.setMileage(100);

        Car savedCar = Car.builder()
                .id(1L)
                .brand("Tesla")
                .model("Model S")
                .year(2023)
                .price(new BigDecimal("79999"))
                .mileage(100)
                .build();

        when(carRepository.save(any(Car.class))).thenReturn(savedCar);

        // Act
        CarResponseDto response = carService.create(request);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Tesla", response.getBrand());
        assertEquals(new BigDecimal("79999"), response.getPrice());
        verify(carRepository).save(any(Car.class));
    }
}
