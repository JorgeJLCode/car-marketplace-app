package com.carmarketplace;

import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.User;
import com.carmarketplace.repository.CarRepository;
import com.carmarketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCars();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@carmarketplace.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ROLE_ADMIN")
                    .build();

            User user = User.builder()
                    .username("user")
                    .email("user@carmarketplace.com")
                    .password(passwordEncoder.encode("user123"))
                    .role("ROLE_USER")
                    .build();

            userRepository.saveAll(List.of(admin, user));
            log.info("Seeded admin and regular user");
        }
    }

    private void seedCars() {
        if (carRepository.count() == 0) {
            List<Car> cars = List.of(
                    Car.builder().make("Toyota").model("Camry").year(2022).price(25000.0).mileage(15000)
                            .fuelType("Gasoline").transmission("Automatic")
                            .description("Well-maintained Toyota Camry with low mileage. Excellent fuel economy and reliability.")
                            .imageUrl("https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800").build(),
                    Car.builder().make("Honda").model("Civic").year(2021).price(22000.0).mileage(22000)
                            .fuelType("Gasoline").transmission("Manual")
                            .description("Sporty Honda Civic in great condition. Perfect for daily commuting.")
                            .imageUrl("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800").build(),
                    Car.builder().make("Tesla").model("Model 3").year(2023).price(45000.0).mileage(5000)
                            .fuelType("Electric").transmission("Automatic")
                            .description("Nearly new Tesla Model 3 with full self-driving capability. 350-mile range.")
                            .imageUrl("https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800").build(),
                    Car.builder().make("BMW").model("3 Series").year(2021).price(38000.0).mileage(18000)
                            .fuelType("Gasoline").transmission("Automatic")
                            .description("Luxurious BMW 3 Series with premium package. Heated seats, sunroof included.")
                            .imageUrl("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800").build(),
                    Car.builder().make("Ford").model("Mustang").year(2022).price(35000.0).mileage(12000)
                            .fuelType("Gasoline").transmission("Manual")
                            .description("Classic Ford Mustang GT with V8 engine. Iconic American muscle car.")
                            .imageUrl("https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800").build(),
                    Car.builder().make("Volkswagen").model("Golf").year(2020).price(19000.0).mileage(35000)
                            .fuelType("Gasoline").transmission("Manual")
                            .description("Reliable Volkswagen Golf with low running costs. Great city car.")
                            .imageUrl("https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800").build(),
                    Car.builder().make("Mercedes-Benz").model("C-Class").year(2022).price(48000.0).mileage(10000)
                            .fuelType("Diesel").transmission("Automatic")
                            .description("Elegant Mercedes-Benz C-Class with AMG package. Top-of-the-line luxury.")
                            .imageUrl("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800").build(),
                    Car.builder().make("Audi").model("A4").year(2021).price(42000.0).mileage(20000)
                            .fuelType("Diesel").transmission("Automatic")
                            .description("Sophisticated Audi A4 quattro with all-wheel drive. Premium German engineering.")
                            .imageUrl("https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800").build(),
                    Car.builder().make("Chevrolet").model("Equinox").year(2022).price(28000.0).mileage(16000)
                            .fuelType("Gasoline").transmission("Automatic")
                            .description("Spacious Chevrolet Equinox SUV. Perfect for families with advanced safety features.")
                            .imageUrl("https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800").build(),
                    Car.builder().make("Hyundai").model("Ioniq 5").year(2023).price(41000.0).mileage(8000)
                            .fuelType("Electric").transmission("Automatic")
                            .description("Award-winning Hyundai Ioniq 5 with ultra-fast charging. 300-mile range.")
                            .imageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800").build()
            );
            carRepository.saveAll(cars);
            log.info("Seeded 10 sample cars");
        }
    }
}
