# ================================
# Stage 1 — Build with Maven
# ================================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first (caches dependencies layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# ================================
# Stage 2 — Run with lightweight JRE
# ================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built jar from Stage 1
COPY --from=build /app/target/shopwise-backend-1.0.0.jar app.jar

# Expose port
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]