package com.example.pensamientoComputacional.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "El nombre es requerido")
    private String name;

    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe ser válido")
    @Pattern(regexp = ".*@u\\.icesi\\.edu\\.co$", message = "El email debe ser de dominio u.icesi.edu.co")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    private String password;

    @NotBlank(message = "El grupo es requerido")
    private String group;
}