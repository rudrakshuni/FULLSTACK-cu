# JPA Demo - Spring Boot REST API

A demonstration project showcasing Spring Boot with JPA/Hibernate, featuring entity relationships, RESTful APIs, and H2 in-memory database.

## What This Project Does

This is a Spring Boot application that demonstrates:

- **JPA Entity Relationships**: One-to-Many relationship between Category and Product entities
- **REST API Endpoints**: CRUD operations for categories and products
- **Spring Data JPA**: Repository pattern for data access
- **H2 Database**: In-memory database with web console
- **Pagination**: Product listing with price filtering and pagination

### Features

- Create and list product categories
- Create products and associate them with categories
- Retrieve products by price range with pagination
- H2 database console for data inspection
- RESTful API design

## Tech Stack

- **Java 17**
- **Spring Boot 3.5.13**
- **Spring Data JPA**
- **H2 Database**
- **Maven**
- **Lombok**

## Prerequisites

- Java 17 or higher
- Maven (or use included Maven wrapper)

## How to Run

### Option 1: Using Maven Wrapper (Recommended)

**Windows:**
```bash
mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
./mvnw spring-boot:run
```

### Option 2: Using Maven (if installed)

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Endpoints

### Home
- **GET** `/` - Welcome message

### Categories
- **POST** `/categories` - Create a new category
  ```json
  {
    "name": "Electronics"
  }
  ```
- **GET** `/categories` - Get all categories

### Products
- **POST** `/products` - Create a new product
  ```json
  {
    "name": "Laptop",
    "price": 999.99,
    "category": {
      "id": 1
    }
  }
  ```
- **GET** `/products?min=0&max=1000&page=0&size=10` - Get products by price range with pagination
  - `min`: Minimum price (required)
  - `max`: Maximum price (required)
  - `page`: Page number (0-based, required)
  - `size`: Page size (required)

## Database Console

Access the H2 database console at: `http://localhost:8080/h2-console`

**Connection Details:**
- **JDBC URL**: `jdbc:h2:mem:jpa_demo`
- **Username**: `sa`
- **Password**: *(leave empty)*

## Project Structure

```
src/
├── main/
│   ├── java/com/bhumi/jpademo/
│   │   ├── JpaDemoApplication.java          # Main application class
│   │   ├── controller/                      # REST controllers
│   │   │   ├── HomeController.java
│   │   │   ├── CategoryController.java
│   │   │   └── ProductController.java
│   │   ├── entity/                         # JPA entities
│   │   │   ├── Category.java
│   │   │   ├── Product.java
│   │   │   ├── Role.java
│   │   │   └── User.java
│   │   └── repository/                     # Spring Data JPA repositories
│   │       ├── CategoryRepository.java
│   │       ├── ProductRepository.java
│   │       ├── RoleRepository.java
│   │       └── UserRepository.java
│   └── resources/
│       ├── application.properties           # Configuration
│       ├── static/                         # Static resources
│       └── templates/                      # Thymeleaf templates
└── test/
    └── java/com/bhumi/jpademo/
        └── JpaDemoApplicationTests.java     # Unit tests
```

## Configuration

The application uses H2 in-memory database by default. Configuration can be found in `src/main/resources/application.properties`.

## Testing the API

You can test the API using tools like:
- **Postman**
- **curl**
- **Thunder Client** (VS Code extension)
- **Browser** (for GET requests)

### Example API Calls

1. **Create a category:**
   ```bash
   curl -X POST http://localhost:8080/categories \
        -H "Content-Type: application/json" \
        -d '{"name": "Electronics"}'
   ```

2. **Get all categories:**
   ```bash
   curl http://localhost:8080/categories
   ```

3. **Create a product:**
   ```bash
   curl -X POST http://localhost:8080/products \
        -H "Content-Type: application/json" \
        -d '{"name": "Smartphone", "price": 599.99, "category": {"id": 1}}'
   ```

4. **Get products (price range $0-$1000, page 0, size 10):**
   ```bash
   curl "http://localhost:8080/products?min=0&max=1000&page=0&size=10"
   ```

## Building for Production

```bash
mvn clean package
java -jar target/jpa-demo-0.0.1-SNAPSHOT.jar
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is for educational purposes.</content>
<parameter name="filePath">c:\Users\rudra\Desktop\full\fullstack_exp6\README.md