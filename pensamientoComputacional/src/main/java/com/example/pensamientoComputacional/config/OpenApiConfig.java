package com.example.pensamientoComputacional.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI api() {
        return new OpenAPI()
                .info(new Info()
                        .title("Pensamiento Computacional API")
                        .version("v1.0.0")
                        .description("API REST para la gestión educativa y ejercicios de Pensamiento Computacional")
                        .contact(new Contact()
                                .name("Equipo de Desarrollo")
                                .email("dev@u.icesi.edu.co")
                                .url("https://www.icesi.edu.co"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080/pensamientoComputacional-0.0.1-SNAPSHOT")
                                .description("Servidor de desarrollo local"),
                        new Server()
                                .url("http://x104m10:8080/pensamientoComputacional-0.0.1-SNAPSHOT")
                                .description("Servidor de producción")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token obtenido del endpoint /api/auth/login")));
    }
}

