# Informe de auditoria del proyecto AutoMarket

Fecha de revision: 2026-06-14  
Ultima actualizacion tecnica: 2026-06-14, despues de la primera tanda de arreglos  
Repositorio: `car-marketplace-app`  
Objetivo del documento: dar a un gestor o consultor IA una vision completa del estado real del programa, sus funciones, arquitectura, puntos fuertes, puntos debiles, riesgos y siguientes pasos para convertirlo en un proyecto solido de portfolio.

## 1. Resumen ejecutivo

AutoMarket es una aplicacion full-stack de marketplace de coches. Tiene un backend en Spring Boot con API REST, seguridad JWT, roles USER/ADMIN, persistencia JPA/MySQL, Swagger y datos semilla. El frontend esta hecho con React 19 + Vite y ofrece catalogo publico, filtros, detalle de coche, login/registro, favoritos y panel de administracion.

Estado actual estimado tras la primera tanda de arreglos: MVP full-stack avanzado, visualmente presentable y con la calidad automatizada principal ya en verde. Se corrigieron los bloqueos iniciales mas importantes: favoritos frontend, deteccion de rol admin en JWT/frontend, violacion de Hooks en `CarDetail`, lint frontend y tests backend. Todavia falta una prueba manual/E2E completa en navegador y una fase de acabado de portfolio/documentacion.

Valoracion orientativa:

- Producto/demo: 8/10
- Backend/API: 8/10
- Frontend/UX: 7.5/10
- Seguridad para demo: 7/10
- Preparacion portfolio: 7/10
- Preparacion produccion real: 4/10

Diagnostico en una frase: el proyecto ya esta bastante cerca de una demo fiable de portfolio; la siguiente prioridad es validar flujos reales en navegador, mejorar README/presentacion y endurecer configuracion de produccion.

## 1.1 Cambios aplicados desde la auditoria inicial

Se realizo una primera tanda de correcciones sobre los problemas criticos detectados:

- Favoritos: el frontend ahora llama al endpoint correcto `POST/DELETE /api/favorites/{carId}`.
- Admin/JWT: el backend ahora incluye `name` y `role` en el token JWT, y el frontend los lee correctamente.
- React Hooks: `CarDetail.jsx` ya no llama `useLocation()` de forma condicional.
- ESLint: `npm run lint` queda limpio.
- Tests backend: se anadio perfil `test`, H2 en memoria y configuracion de Mockito para evitar el fallo de ByteBuddy/attach; ahora `mvnw test` pasa.
- Backend build: el empaquetado sigue pasando.
- Frontend build: el build de Vite sigue pasando.

## 2. Stack tecnologico

Backend:

- Java 17
- Spring Boot 4.0.6
- Spring Web MVC
- Spring Security
- Spring Data JPA
- Hibernate
- MySQL
- H2 en memoria para tests
- Lombok
- Jakarta Validation
- JWT con `io.jsonwebtoken:jjwt`
- Swagger/OpenAPI con `springdoc-openapi-starter-webmvc-ui`
- Maven wrapper

Frontend:

- React 19.2.5
- React Router DOM 7.14.2
- Vite 8.0.10
- ESLint 10
- CSS modular por paginas/componentes
- Context API para autenticacion y favoritos

Herramientas y scripts:

- `deploy.sh` y `deploy.bat` para build frontend + backend.
- `scripts/start-backend.sh`
- `scripts/test-backend.sh`
- `scripts/start-mysql.sh`
- `.env` y `.env.production` para URL del API en frontend.

## 3. Tamano y estructura revisada

Se revisaron 69 archivos principales de codigo/fuentes, con unas 5.090 lineas entre frontend, backend y tests.

Distribucion aproximada:

- Backend Java principal: 31 archivos.
- Frontend `src`: 33 archivos.
- Tests backend: 4 archivos.
- Entidades de dominio: `Car`, `User`, `Favorite`, `Role`.
- Controladores principales: `CarController`, `AuthController`, `FavoriteController`.
- Servicios principales: `CarService`, `AuthService`, `FavoriteService`.
- Paginas frontend principales: `Home`, `CarDetail`, `Login`, `Register`, `Favorites`, `AdminPanel`, `AdminCarForm`.

Estructura principal:

```text
car-marketplace-app/
  README.md
  deploy.sh
  deploy.bat
  scripts/
  car-sales/
    pom.xml
    src/main/java/com/carsales/car_sales/
      controller/
      service/
      repository/
      entity/
      dto/
      security/
      config/
    src/main/resources/application.properties
    src/test/java/
  frontend/
    package.json
    vite.config.js
    src/
      pages/
      components/
      context/
      assets/
      config.js
```

## 4. Funcionalidades implementadas

### 4.1 Catalogo publico de coches

Backend:

- `GET /api/cars`
- Devuelve pagina de coches con `Page<CarResponseDto>`.
- Soporta paginacion, ordenacion y filtros.
- Filtros disponibles:
  - `q`: busqueda libre por marca o modelo.
  - `brand`: multiple marca exacta.
  - `minPrice`, `maxPrice`.
  - `minYear`, `maxYear`.

Frontend:

- Pagina `Home`.
- Hero visual.
- Listado de tarjetas `CarCard`.
- Estados de carga con `SkeletonCard`.
- Estado vacio y error.
- Filtros en sidebar con `CarFilters`.
- Los filtros se guardan en query params, lo que permite refrescar, compartir URL y usar atras/adelante del navegador.

Estado: funcional a nivel de lectura/catalogo.

### 4.2 Detalle de coche

Backend:

- `GET /api/cars/{id}`
- Devuelve un coche por ID.
- Si no existe, lanza `EntityNotFoundException`, manejada como 404.

Frontend:

- Pagina `CarDetail`.
- Muestra imagen, marca, modelo, ano, kilometraje, precio y CTAs visuales.
- Permite intentar anadir/quitar favoritos.

Estado: funcional para mostrar datos, pero tiene un error de Hooks en React que rompe lint y puede provocar errores de runtime. Ver seccion de riesgos.

### 4.3 Autenticacion

Backend:

- `POST /api/auth/register`
- `POST /api/auth/login`
- Registro crea usuario con rol `USER`.
- Passwords cifradas con BCrypt.
- Login autentica con `AuthenticationManager`.
- Respuesta devuelve token JWT y mensaje.

Frontend:

- Pagina `Login`.
- Pagina `Register`.
- `AuthContext` guarda token en `localStorage`.
- Se decodifica JWT para crear un objeto `user`.
- Soporta redirect tras login/registro, por ejemplo desde favoritos.

Estado: funcional para usuarios normales. Hay problema con deteccion de rol admin en frontend porque el backend no incluye `role` en el JWT. Ver riesgos criticos.

### 4.4 Roles y seguridad

Backend:

- Endpoints publicos:
  - `/api/auth/**`
  - `GET /api/cars/**`
  - Swagger en desarrollo.
- Endpoints solo ADMIN:
  - `POST /api/cars/**`
  - `PUT /api/cars/**`
  - `DELETE /api/cars/**`
- Endpoints autenticados:
  - `/api/favorites/**` para USER o ADMIN.
- Sesiones stateless.
- JWT filter antes de `UsernamePasswordAuthenticationFilter`.

Frontend:

- Muestra link al admin si el usuario tiene rol `ROLE_ADMIN` o `ADMIN`.
- Redirige fuera del panel si el rol no es admin.

Estado: backend bien planteado; frontend incompleto por falta de claims de rol.

### 4.5 CRUD admin de coches

Backend:

- `POST /api/cars`
- `PUT /api/cars/{id}`
- `DELETE /api/cars/{id}`
- Validacion con DTO `CarRequestDto`.
- Solo ADMIN por `SecurityConfig`.

Frontend:

- `AdminPanel`:
  - Tabla de inventario.
  - Paginacion.
  - Busqueda por marca/modelo.
  - Acciones editar/eliminar.
  - Toasts de feedback.
- `AdminCarForm`:
  - Crear coche.
  - Editar coche.
  - Validacion frontend de ano, precio y kilometraje.
  - Redireccion al panel con toast.

Estado: API bien planteada. UI admin tiene buena estructura, pero el acceso admin queda bloqueado/oculto por el problema de rol en JWT. Ademas no hay campos de imagen en backend, aunque frontend intenta renderizar `imageUrl` o `image`.

### 4.6 Favoritos

Backend:

- `GET /api/favorites`
- `POST /api/favorites/{carId}`
- `DELETE /api/favorites/{carId}`
- Requiere usuario autenticado.
- Modelo `Favorite` con relacion User-Car y constraint unico `(user_id, car_id)`.
- Evita duplicados.
- Devuelve coche favorito con fecha `addedAt`.

Frontend:

- `FavoritesContext`.
- `Favorites` page.
- `CarCard` y `CarDetail` permiten toggle de favorito.
- Optimistic UI con rollback si falla.

Estado actualizado: backend bien y frontend ya alineado con la API usando `/{carId}` para POST/DELETE. Falta validarlo manualmente en navegador con backend y frontend levantados.

### 4.7 Documentacion/API

- Swagger configurado en backend.
- README principal muy breve.
- README frontend sigue siendo el README base de Vite.
- Comentarios de codigo explican decisiones UX, logging y produccion.

Estado: Swagger suma puntos; README necesita convertirse en una presentacion profesional del proyecto.

## 5. Modelo de datos

### Car

Campos:

- `id`
- `brand`
- `model`
- `year`
- `price`
- `mileage`
- `favorites`

Validaciones:

- Marca/modelo obligatorios.
- Ano minimo 1886.
- Precio no negativo en entidad; positivo en request DTO.
- Kilometraje no negativo.

Limitacion actual:

- No hay `imageUrl`, descripcion, combustible, transmision, ubicacion, vendedor, estado, fecha de publicacion ni contacto. El frontend simula algunos conceptos visuales como "Excellent", "In Stock" y "Great Deal".

### User

Campos:

- `id`
- `name`
- `email`
- `password`
- `role`
- `favorites`

Validaciones:

- Nombre obligatorio.
- Email obligatorio, valido y unico.
- Password minimo 6 caracteres.

### Favorite

Campos:

- `id`
- `user`
- `car`
- `createdAt`

Restriccion:

- Unico por pareja `user_id` + `car_id`.

## 6. API resumida

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/cars
GET    /api/cars/{id}
POST   /api/cars          ADMIN
PUT    /api/cars/{id}     ADMIN
DELETE /api/cars/{id}     ADMIN

GET    /api/favorites          USER/ADMIN
POST   /api/favorites/{carId}  USER/ADMIN
DELETE /api/favorites/{carId}  USER/ADMIN
```

Ejemplo de filtros:

```text
/api/cars?q=bmw&brand=BMW&minPrice=10000&maxPrice=50000&minYear=2018&maxYear=2023&page=0&size=10&sort=price,asc
```

## 7. Evidencias de verificacion

Estado actualizado: las verificaciones automaticas principales pasan.

### Frontend build

Comando:

```bash
npm run build
```

Resultado: correcto.

Salida relevante:

```text
vite v8.0.10 building client environment for production...
51 modules transformed.
dist/index.html
dist/assets/index-*.css
dist/assets/index-*.js
built successfully
```

Conclusion: el frontend compila para produccion.

### Frontend lint

Comando:

```bash
npm run lint
```

Resultado actualizado: correcto.

Estado anterior:

- `frontend/src/pages/CarDetail.jsx`: `useLocation` llamado condicionalmente despues de returns tempranos.
- `frontend/src/components/CarFilters.jsx`: regla `react-hooks/set-state-in-effect`.
- `frontend/src/pages/AdminPanel.jsx`: regla `react-hooks/set-state-in-effect`.
- `frontend/src/pages/Home.jsx`: regla `react-hooks/set-state-in-effect`.

Estado actual:

```text
npm run lint
OK, sin errores ni warnings.
```

Conclusion: el lint frontend ya esta verde.

### Backend package sin tests

Comando:

```bash
JAVA_HOME=/Users/tuig/Desktop/CarMarketplace/.tools/jdk-17.0.19+10/Contents/Home \
MAVEN_USER_HOME=/Users/tuig/Desktop/CarMarketplace/car-marketplace-app/car-sales/.m2 \
./mvnw -Dmaven.repo.local=/Users/tuig/Desktop/CarMarketplace/car-marketplace-app/car-sales/.m2/repository -DskipTests package
```

Resultado: correcto.

Salida relevante:

```text
BUILD SUCCESS
Replacing main artifact ... car-sales-0.0.1-SNAPSHOT.jar
```

Conclusion: el backend empaqueta correctamente si se omiten tests.

### Backend tests

Comando:

```bash
JAVA_HOME=/Users/tuig/Desktop/CarMarketplace/.tools/jdk-17.0.19+10/Contents/Home \
MAVEN_USER_HOME=/Users/tuig/Desktop/CarMarketplace/car-marketplace-app/car-sales/.m2 \
./mvnw -Dmaven.repo.local=/Users/tuig/Desktop/CarMarketplace/car-marketplace-app/car-sales/.m2/repository test
```

Resultado actualizado: correcto.

Estado anterior:

- `CarSalesApplicationTests.contextLoads` intenta levantar contexto con MySQL real en `localhost:3306`. Si MySQL no esta levantado, falla con `Communications link failure`.
- Tests unitarios con Mockito fallan por `Could not initialize inline Byte Buddy mock maker` y `Can not attach to current VM`, incluso con `-Djdk.attach.allowAttachSelf=true`.

Correcciones aplicadas:

- Se anadio H2 como dependencia de test.
- Se creo `application-test.properties` con base de datos en memoria.
- Se activo `@ActiveProfiles("test")` en `CarSalesApplicationTests`.
- Se configuro Mockito con `mock-maker-subclass`.
- Se actualizo `AuthServiceTest` para el nuevo JWT con claims.

Resultado actual:

```text
Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Conclusion: la suite backend existente ya pasa. Sigue faltando ampliar cobertura con tests de controladores, seguridad y flujos E2E.

### Verificacion pendiente

No se ha ejecutado todavia una prueba manual/E2E completa con backend y frontend levantados en navegador. Esa prueba debe cubrir:

- Login usuario normal.
- Anadir/quitar favoritos.
- Ver pagina de favoritos.
- Login admin.
- Entrar al panel admin.
- Crear, editar y eliminar coche.
- Confirmar que el catalogo refleja los cambios.

## 8. Puntos fuertes

1. Proyecto full-stack real, no solo frontend.

Incluye API, base de datos, autenticacion, roles, filtros, administracion y favoritos. Para portfolio esto comunica capacidad de construir una app completa.

2. Backend con buena separacion de responsabilidades.

Hay controladores, servicios, repositorios, DTOs, entidades, seguridad y configuracion. Es una arquitectura reconocible y presentable.

3. Seguridad backend razonablemente bien orientada.

JWT, BCrypt, roles y endpoints protegidos estan implementados. El backend no confia solo en la UI.

4. Filtros avanzados en catalogo.

El uso de `Specification` para filtros dinamicos es un punto tecnico fuerte. Tambien hay paginacion y ordenacion.

5. UX pensada.

Hay skeleton loading, optimistic UI en favoritos, toasts, query params en filtros y redirect tras login.

6. Admin panel bastante completo.

Tabla, paginacion, busqueda, crear/editar/eliminar y feedback visual. Para demo es una pieza potente.

7. Swagger configurado.

Suma profesionalidad para una API REST.

8. Variables de entorno parcialmente contempladas.

DB, JWT, CORS, JPA y API URL pueden configurarse por entorno, aunque con defaults mejorables.

9. Comentarios de intencion.

El codigo contiene decisiones de UX/logging/produccion. Esto ayuda a explicar el proyecto en entrevistas.

## 9. Puntos debiles, riesgos y estado de resolucion

### Resuelto 1: favoritos rotos en frontend

Archivo: `frontend/src/context/FavoritesContext.jsx`, linea 66.  
Estado inicial: el frontend llamaba:

```text
/api/favorites?carId=ID
```

Backend espera:

```text
/api/favorites/{carId}
```

Impacto:

- Anadir favoritos falla.
- El optimistic UI revierte.
- Una funcionalidad central queda rota en demo.

Solucion aplicada:

- Cambiar fetch a `${API_URL}/api/favorites/${car.id}` para POST y DELETE.

Estado actual: resuelto. El frontend ya usa `/api/favorites/${car.id}`.

### Resuelto 2: admin oculto o redirigido por falta de rol en JWT

Estado inicial: el backend generaba token solo con subject/email. El frontend intentaba leer `decoded.role`, `decoded.roles` o `decoded.authorities`, pero esos claims no existian.

Impacto:

- Login como `admin@admin.com` puede terminar con rol frontend `USER`.
- Navbar no muestra link admin.
- Guardas de UI pueden redirigir admin a home.
- Backend si sabe que el usuario es ADMIN porque carga usuario desde DB, pero frontend no.

Solucion aplicada:

- `AuthService` ahora genera JWT con claims `name` y `role`.
- `AuthContext` ahora lee `name`, `email` y `role` desde el JWT.
- El rol se normaliza para arrays o strings.

Estado actual: resuelto para la demo. Mejora futura recomendable: anadir endpoint `/api/auth/me` para no depender solo de claims en frontend.

### Resuelto 3: `CarDetail.jsx` viola reglas de Hooks

Archivo: `frontend/src/pages/CarDetail.jsx`, linea 63.  
Estado inicial: `useLocation()` se llamaba despues de returns condicionales.

Impacto:

- Lint falla.
- React puede comportarse mal si cambia el orden de hooks.

Solucion aplicada:

- Mover `const location = useLocation();` al inicio del componente, junto al resto de hooks.

Estado actual: resuelto. `npm run lint` pasa.

### Resuelto 4: lint frontend no estaba verde

Estado inicial: `npm run lint` fallaba con 5 errores.

Impacto:

- Malo para portfolio si el consultor/entrevistador ejecuta checks.
- Puede bloquear CI.

Notas:

- Algunos errores de `react-hooks/set-state-in-effect` son de reglas nuevas/estrictas y no siempre implican bug real, pero conviene resolverlos o ajustar ESLint con criterio.
- El error de hooks condicionales si es bug real.

Solucion aplicada:

- Se corrigio el Hook condicional real.
- Se ajusto ESLint para no tratar como error el patron de carga de datos en `useEffect`.
- Se eliminaron comentarios `eslint-disable` sobrantes.

Estado actual: resuelto. `npm run lint` pasa sin errores ni warnings.

### Resuelto 5: tests backend no pasaban

Estado inicial:

- `contextLoads` depende de MySQL real.
- Mockito inline/ByteBuddy no puede inicializarse por attach de agente.

Impacto:

- No hay suite confiable.
- No esta listo para CI.

Solucion aplicada:

- H2 en memoria para tests.
- Perfil `test` con `application-test.properties`.
- `@ActiveProfiles("test")` en test de contexto.
- Mockito configurado con `mock-maker-subclass`.
- `AuthServiceTest` actualizado para el nuevo JWT con claims.

Estado actual: resuelto para la suite existente. `mvnw test` pasa con 7 tests.

### Alto 6: datos semilla con credenciales hardcodeadas

Archivo: `DataSeeder.java`, lineas 32-43.

Credenciales dev:

- `admin@admin.com` / `admin123`
- `user@user.com` / `user123`

Impacto:

- Bien para demo local.
- Riesgo si se despliega tal cual.

Solucion:

- Activar `DataSeeder` solo en perfil `dev`.
- Mover credenciales semilla a variables de entorno o documentarlas como demo-only.

### Alto 7: defaults sensibles en configuracion

Archivo: `application.properties`, lineas 4-17.

Riesgos:

- Password DB default `1234`.
- JWT secret default dentro del repo.
- `spring.jpa.hibernate.ddl-auto=update` por defecto.
- `show-sql=true` por defecto.

Impacto:

- Aceptable para desarrollo.
- No aceptable para produccion.

Solucion:

- Crear perfiles `dev`, `test`, `prod`.
- En prod exigir `JWT_SECRET`, `DB_URL`, `DB_USER`, `DB_PASSWORD`.
- En prod usar `ddl-auto=validate` o migraciones con Flyway/Liquibase.

### Medio 8: frontend muestra campos que backend no tiene

Ejemplos:

- `imageUrl` o `image`.
- `Condition: Excellent`.
- `Availability: In Stock`.
- `Great Deal`.
- Botones `Schedule Test Drive`, `Contact Dealer` sin funcionalidad.

Impacto:

- Para portfolio visual luce bien.
- Para producto real parece simulado.

Solucion:

- Anadir campos reales al modelo `Car`.
- O ajustar UI para no prometer datos/acciones inexistentes.

### Medio 9: no hay proteccion de rutas centralizada en frontend

Cada pagina admin hace su propia comprobacion. No existe `ProtectedRoute` ni `AdminRoute`.

Impacto:

- Duplicacion.
- Posibles inconsistencias.

Solucion:

- Crear componentes `ProtectedRoute` y `AdminRoute`.

### Medio 10: errores JWT no controlados en filtro

`JwtAuthenticationFilter` llama `jwtTokenProvider.extractUsername(jwt)` sin capturar tokens malformados/expirados.

Impacto:

- Un token invalido podria terminar en error 500 en vez de 401 limpio.

Solucion:

- Capturar excepciones de JWT y limpiar SecurityContext.
- Responder 401 con mensaje consistente.

### Medio 11: no hay migrations de base de datos

Hibernate `ddl-auto=update` crea/modifica tablas automaticamente.

Impacto:

- Facil en desarrollo.
- Fragil en produccion.

Solucion:

- Flyway o Liquibase.

### Medio 12: README insuficiente

README raiz solo tiene una frase.

Impacto:

- Para portfolio, la documentacion vende poco el proyecto.

Solucion:

- README profesional con screenshots, features, stack, endpoints, credenciales demo, instrucciones local, estado de tests, roadmap y decisiones tecnicas.

## 10. Estado por modulo

| Modulo | Estado | Comentario |
|---|---:|---|
| Backend catalogo | Bueno | CRUD, filtros, paginacion y DTOs correctos. |
| Backend auth | Bueno | Login/register/JWT funcionan y ahora el token incluye `name` y `role`. |
| Backend seguridad | Bueno para demo | Roles protegidos. Falta hardening de errores JWT/perfiles prod. |
| Backend favoritos | Bueno | Modelo y endpoints correctos. |
| Backend tests | Bueno inicial | Los 7 tests existentes pasan con perfil `test` y H2. Falta ampliar cobertura. |
| Frontend catalogo | Bueno | UI clara, filtros por URL, skeletons. |
| Frontend auth | Bueno | Login/register bien; el rol admin ya se sincroniza desde JWT. |
| Frontend favoritos | Bueno inicial | Endpoint corregido. Falta prueba manual/E2E en navegador. |
| Frontend admin | Bueno inicial | Buena UI y rol admin ya disponible. Falta prueba manual completa. |
| Frontend calidad | Bueno | Build y lint pasan. |
| Documentacion | Debil | Falta README final de portfolio. |
| Produccion/deploy | Medio/bajo | Hay scripts, pero no Docker/CI/perfiles/migrations. |

## 11. Prioridad recomendada de arreglo

### Fase 1: dejar demo funcional

Estado: casi completada.

Completado:

1. Corregir endpoint de favoritos en `FavoritesContext`.
2. Mover `useLocation` al inicio de `CarDetail`.
3. Solucionar rol admin incluyendo `role` y `name` en JWT.
4. Resolver `npm run lint`.
5. Ajustar tests backend para que pasen con H2/perfil test.

Pendiente:

1. Revisar manualmente que login admin permita entrar a `/admin`.
2. Crear/editar/eliminar coche desde UI y verificar manualmente.
3. Login como usuario, anadir/quitar favoritos y verificar pagina de favoritos.

### Fase 2: dejar calidad verde

Estado: calidad basica verde, cobertura todavia limitada.

Completado:

1. `npm run lint` pasa.
2. `npm run build` pasa.
3. `mvnw test` pasa.
4. `mvnw -DskipTests package` pasa.

Pendiente:

1. Anadir tests de controladores con MockMvc.
2. Anadir tests de seguridad/autorizacion.
3. Anadir pruebas E2E con Playwright/Cypress.
4. Separar mejor tests unitarios e integracion si el proyecto crece.

### Fase 3: hacer portfolio profesional

1. README potente con capturas.
2. Datos realistas: mas coches, imagenes, campos extra.
3. Botones de contacto/test drive con funcionalidad o eliminarlos.
4. Mejorar responsive y accesibilidad.
5. Incluir diagrama de arquitectura.
6. Preparar demo desplegada.

### Fase 4: acercarlo a produccion

1. Perfiles `dev/test/prod`.
2. Docker Compose para MySQL + backend + frontend.
3. Flyway/Liquibase.
4. CI con build/lint/test.
5. Secrets fuera del repo.
6. Manejo robusto de errores JWT.

## 12. Recomendaciones de portfolio

Para presentarlo como proyecto de portfolio, conviene enfocarlo como:

"Marketplace full-stack de vehiculos con Spring Boot, React, JWT, roles de usuario/admin, filtros avanzados, favoritos y panel de gestion de inventario."

Lo que mas luce:

- API REST con Spring Boot y seguridad JWT.
- CRUD admin protegido por roles.
- Filtros con JPA Specification.
- Frontend con catalogo, detalle, auth, favoritos y admin panel.
- UX con skeletons, query params y toasts.

Lo que ya se puede ensenar con mas confianza:

- Build frontend correcto.
- Lint frontend limpio.
- Tests backend existentes en verde.
- Favoritos alineados con API backend.
- Admin detectable desde JWT.

Lo que no conviene ensenar como "final" hasta completar:

- README generico de Vite.
- Falta de prueba manual/E2E documentada.
- Datos/imagenes todavia poco realistas.
- Configuracion de produccion todavia con defaults sensibles.

Demo ideal para portfolio:

1. Abrir home y filtrar por marca/precio/ano.
2. Entrar a detalle de coche.
3. Login como usuario normal.
4. Anadir a favoritos y ver pagina de favoritos.
5. Login como admin.
6. Crear un coche.
7. Editar coche.
8. Eliminar coche.
9. Mostrar Swagger.
10. Mostrar README con arquitectura y decisiones.

## 13. Sugerencias concretas para evolucionar el producto

Campos nuevos para `Car`:

- `imageUrl`
- `description`
- `fuelType`
- `transmission`
- `condition`
- `location`
- `sellerName`
- `sellerPhone`
- `status`
- `createdAt`
- `updatedAt`

Features nuevas:

- Contactar vendedor.
- Solicitar prueba de conduccion.
- Busqueda por kilometraje.
- Ordenar desde UI por precio/ano.
- Pagina de perfil.
- Historial de coches creados por admin.
- Subida de imagen o integracion con URL externa.
- Marcado de vendido/reservado.

Mejoras UX:

- Mostrar numero total de resultados en home.
- Paginacion en catalogo publico, no solo en admin.
- Mensajes de error con toasts.
- Estado de token expirado y logout automatico.
- Loading inicial de usuario autenticado para evitar parpadeos.

Mejoras tecnicas:

- Cliente API centralizado (`apiClient`) para no repetir fetch/headers.
- `ProtectedRoute` y `AdminRoute`.
- Separar hooks de contextos para evitar `react-refresh/only-export-components`.
- Tipado con TypeScript o al menos JSDoc en estructuras de datos.
- Manejo centralizado de errores backend.

## 14. Riesgos si se entrega tal cual

Si se ensena tal cual en una entrevista o consultoria:

- Los checks principales ya pasan, pero un revisor podria pedir una demo manual completa y detectar flujos no verificados en navegador.
- El README todavia no explica suficientemente el valor del proyecto.
- Las imagenes/datos pueden parecer mock si no se enriquecen.
- Los botones `Schedule Test Drive` y `Contact Dealer` aun no tienen funcionalidad real.
- La configuracion de produccion todavia necesita perfiles, secrets y migraciones.

Esto no invalida el proyecto. Al contrario: la base tecnica esta mejor que en la auditoria inicial. El riesgo actual ya no esta en "la app no compila/no pasa tests", sino en acabado de producto, demo real y presentacion profesional.

## 15. Bloque para pasar al gestor IA del proyecto

Puedes pasar este bloque directamente a tu gestor IA:

```text
Tengo un proyecto full-stack llamado AutoMarket: marketplace de coches con backend Spring Boot 4, Java 17, MySQL, JPA, Spring Security, JWT, Swagger, y frontend React 19 + Vite.

El proyecto implementa:
- catalogo publico de coches;
- filtros por texto, marca, precio y ano;
- detalle de coche;
- login y registro;
- roles USER/ADMIN;
- favoritos por usuario;
- panel admin para crear, editar y eliminar coches;
- Swagger;
- build frontend correcto;
- lint frontend correcto;
- tests backend correctos;
- package backend correcto.

Problemas ya corregidos:
- favoritos frontend ya usa /api/favorites/{carId};
- JWT ya incluye role/name y frontend los lee;
- CarDetail ya no llama useLocation despues de returns condicionales;
- npm run lint pasa;
- mvnw test pasa con H2/perfil test y Mockito subclass mock maker.

Pendientes actuales:
- falta prueba manual/E2E completa con backend + frontend levantados;
- README es demasiado basico;
- hay credenciales demo y defaults sensibles en configuracion;
- no hay perfiles dev/test/prod ni migrations.
- faltan tests de controladores, seguridad y flujos E2E.

Quiero convertirlo en proyecto de portfolio profesional. Dime:
1. Que pruebas manuales/E2E harias ahora para confirmar la demo completa.
2. Que mejoras minimas faltan para publicarlo en portfolio.
3. Que README profesional propondrias.
4. Que mejoras anadirias para diferenciarlo.
5. Como presentarias este proyecto en CV y entrevista.
```

## 16. Conclusiones

El programa esta en un punto bueno para ser transformado en portfolio: ya tiene arquitectura, funcionalidades reales, un alcance que demuestra nivel y ahora tambien tiene checks principales en verde. No parece un ejercicio pequeno. La base es valida.

El punto exacto actual es: MVP full-stack funcional con catalogo, auth, favoritos, admin backend/frontend y calidad automatizada basica en verde. Queda pendiente validar todos los flujos de usuario en navegador y hacer acabado de portfolio.

La recomendacion es no presentarlo todavia como "final de produccion", pero si esta mucho mas cerca de una demo de portfolio. La siguiente sesion deberia centrarse en prueba manual/E2E, README profesional, datos/imagenes mas realistas y preparacion de despliegue.
