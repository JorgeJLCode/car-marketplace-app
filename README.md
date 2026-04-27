# car-marketplace-app
Full-stack car marketplace application built with Spring Boot and React. Includes authentication, car management, filtering, favorites, and admin panel.

## Tech Stack

**Backend:** Java 17, Spring Boot 3, Spring Security, JWT, Spring Data JPA, H2 (in-memory)  
**Frontend:** React 18, Vite, React Router 6, Axios

## Features

- 🔐 JWT authentication (register/login)
- 🚗 Browse cars with filters (keyword, make, year, price, fuel type, transmission)
- 📄 Paginated car listing
- 🔍 Car detail page
- ❤️ Favorites system (authenticated users)
- 🛠️ Admin panel for full car CRUD (admin users)

## Quick Start

### Backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/car-marketplace-backend-0.0.1-SNAPSHOT.jar
```

The API starts on `http://localhost:8080`.

**Default users seeded on startup:**
| Username | Password  | Role       |
|----------|-----------|------------|
| admin    | admin123  | ROLE_ADMIN |
| user     | user123   | ROLE_USER  |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

## API Endpoints

| Method | Path                  | Access        | Description              |
|--------|-----------------------|---------------|--------------------------|
| POST   | /api/auth/register    | Public        | Register new user        |
| POST   | /api/auth/login       | Public        | Login, returns JWT token |
| GET    | /api/cars             | Public        | List/filter/search cars  |
| GET    | /api/cars/{id}        | Public        | Get car details          |
| POST   | /api/cars             | ROLE_ADMIN    | Create car               |
| PUT    | /api/cars/{id}        | ROLE_ADMIN    | Update car               |
| DELETE | /api/cars/{id}        | ROLE_ADMIN    | Delete car               |
| GET    | /api/favorites        | Authenticated | Get user's favorites     |
| POST   | /api/favorites/{id}   | Authenticated | Add to favorites         |
| DELETE | /api/favorites/{id}   | Authenticated | Remove from favorites    |

### Car Listing Query Parameters

`GET /api/cars?make=Toyota&minPrice=20000&maxPrice=50000&fuelType=Gasoline&page=0&size=10&sortBy=price&sortDir=asc`

## Security Notes

- **JWT** tokens are used for stateless authentication (stored in `Authorization: Bearer <token>` header)
- **CSRF protection** is intentionally disabled because this is a stateless JWT REST API; all state mutations require an Authorization header that cannot be set by cross-site requests
- Passwords are hashed with **BCrypt**
- CORS is restricted to `http://localhost:5173` by default
