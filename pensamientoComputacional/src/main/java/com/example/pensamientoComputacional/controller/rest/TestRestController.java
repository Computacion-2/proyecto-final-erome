package com.example.pensamientoComputacional.controller.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
@Tag(name = "Test", description = "Endpoints de prueba para verificar el funcionamiento de la API")
public class TestRestController {

    @GetMapping
    @Operation(summary = "Verificar estado de la API", description = "Endpoint de prueba para verificar que la API está funcionando correctamente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "API funcionando correctamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public String test() {
        return "REST API is working!";
    }
}
