# Multi-stage build for Spring Boot (Java 21) WAR

# ---- Build stage ----
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy Maven descriptor and wrapper first to leverage caching
COPY pom.xml ./
COPY mvnw mvnw
# Copy .mvn folder only if it exists to support wrapper cache
# If it does not exist, the next step still works because we fall back to mvn
COPY .mvn .mvn

# Pre-fetch dependencies (no source yet for better cache)
RUN ./mvnw -q -B -DskipTests dependency:go-offline || mvn -q -B -DskipTests dependency:go-offline

# Copy source
COPY src ./src

# Build the application (skip tests for faster image build; adjust if needed)
RUN ./mvnw -q -B -DskipTests package || mvn -q -B -DskipTests package

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre

# Use a non-root user for security
RUN useradd -ms /bin/bash appuser
USER appuser

WORKDIR /app

# Copy the built artifact
COPY --from=build /workspace/target/pensamientoComputacional-0.0.1-SNAPSHOT.war /app/app.war

EXPOSE 8080

# Optional: JVM tuning via env var
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"

# Spring profile can be overridden at runtime
ENV SPRING_PROFILES_ACTIVE=default

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.war --server.port=8080 --spring.profiles.active=${SPRING_PROFILES_ACTIVE}"]
