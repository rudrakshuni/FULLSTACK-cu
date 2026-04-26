# JWT Authentication Example

A Spring Boot 3.5 application demonstrating JWT-based authentication and authorization with Spring Security, Spring Data JPA, H2 in-memory database, and REST API endpoints.

## Features

- User registration and login using JWT tokens
- Stateless security with `JwtAuthenticationFilter`
- Role-based access control for `/api/user` and `/api/admin`
- Public endpoint at `/api/public`
- H2 in-memory database configured with console access

## Technology Stack

- Java 17
- Spring Boot 3.5.13
- Spring Security
- Spring Data JPA
- H2 Database
- JSON Web Tokens (JJWT)
- Maven

## Project Structure

- `src/main/java/com/example/jwt_auth/controller`
  - `AuthController` — registration and login endpoints
  - `TestController` — public and protected API endpoints
- `src/main/java/com/example/jwt_auth/config`
  - `SecurityConfig` — security filter chain and password encoder
- `src/main/java/com/example/jwt_auth/security`
  - `JwtAuthenticationFilter` — validates JWT in incoming requests
- `src/main/java/com/example/jwt_auth/util`
  - `JwtUtil` — token generation and validation logic
- `src/main/resources/application.properties` — app configuration and JWT settings

## Running the Application

### Prerequisites

- Java 17
- Maven

### Build and run

```bash
mvn clean package
mvn spring-boot:run
```

The application starts on port `8080` by default.

## API Endpoints

### Authentication

- `POST /auth/register`
  - Request body: `{ "username": "user", "password": "pass" }`
  - Registers a new user with the `ROLE_USER` role.
  - Returns a success message or a duplicate username warning.

- `POST /auth/login`
  - Request body: `{ "username": "user", "password": "pass" }`
  - Returns a JWT token on successful authentication:
    - `{ "token": "<jwt>" }`

### Public API

- `GET /api/public`
  - No authentication required.
  - Returns a simple public message.

### Protected API

- `GET /api/user`
  - Requires `Authorization: Bearer <token>`
  - Requires role `USER`

- `GET /api/admin`
  - Requires `Authorization: Bearer <token>`
  - Requires role `ADMIN`

> Note: Users created by `/auth/register` are assigned the `ROLE_USER` role by default.

## H2 Database Console

The H2 console is enabled at:

- `http://localhost:8080/h2-console`

Use these defaults:

- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (empty)

## JWT Configuration

Configured in `src/main/resources/application.properties`:

- `jwt.secret` — secret key used to sign tokens
- `jwt.expiration` — token lifetime in milliseconds

## Notes

- CSRF is disabled for simplicity because the app uses stateless JWT authentication.
- Passwords are stored hashed with BCrypt.
- Modify the secret key and token expiration for production use.

## Build Artifact

The Maven artifact is configured as:

- `groupId`: `com.example`
- `artifactId`: `jwt-auth`
- `version`: `0.0.1-SNAPSHOT`
