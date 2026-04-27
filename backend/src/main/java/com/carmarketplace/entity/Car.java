package com.carmarketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cars")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String make;
    @Column(nullable = false)
    private String model;
    @Column(nullable = false)
    private Integer year;
    @Column(nullable = false)
    private Double price;
    private Integer mileage;
    private String fuelType;
    private String transmission;

    @Column(length = 2000)
    private String description;

    private String imageUrl;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
