package com.carsales.car_sales.config;

import com.carsales.car_sales.entity.Car;
import com.carsales.car_sales.entity.Role;
import com.carsales.car_sales.entity.User;
import com.carsales.car_sales.repository.CarRepository;
import com.carsales.car_sales.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Sembrar usuarios si no existen
        if (userRepository.count() == 0) {
            log.info("Creando usuarios iniciales (admin y user)...");
            
            User admin = User.builder()
                    .name("Administrador")
                    .email("admin@admin.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            
            User user = User.builder()
                    .name("Usuario Prueba")
                    .email("user@user.com")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.USER)
                    .build();
                    
            userRepository.saveAll(List.of(admin, user));
            log.info("Usuarios creados con éxito.");
        }

        // Sembrar coches si no existen
        if (carRepository.count() == 0) {
            log.info("Creando coches iniciales de prueba...");
            
            List<Car> cars = List.of(
                    Car.builder().brand("Toyota").model("Corolla").year(2022).price(new BigDecimal("22000")).mileage(15000).build(),
                    Car.builder().brand("Honda").model("Civic").year(2021).price(new BigDecimal("21500")).mileage(20000).build(),
                    Car.builder().brand("Ford").model("Mustang").year(2023).price(new BigDecimal("35000")).mileage(5000).build(),
                    Car.builder().brand("Chevrolet").model("Camaro").year(2020).price(new BigDecimal("30000")).mileage(25000).build(),
                    Car.builder().brand("BMW").model("Serie 3").year(2022).price(new BigDecimal("45000")).mileage(10000).build()
            );
            
            carRepository.saveAll(cars);
            log.info("Coches creados con éxito.");
        }
    }
}
