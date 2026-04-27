package com.carsales.car_sales.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteResponseDto {
    private Long favoriteId;
    private LocalDateTime addedAt;
    private CarResponseDto car;
}
