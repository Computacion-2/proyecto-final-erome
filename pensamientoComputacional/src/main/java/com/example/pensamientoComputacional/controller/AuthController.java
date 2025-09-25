package com.example.pensamientoComputacional.controller;

import com.example.pensamientoComputacional.service.AuthService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/login")
    public String loginPage() {
        return "auth/login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "auth/register";
    }

    @PostMapping("/register")
    public String handleRegister(@RequestParam @NotBlank String name,
                                 @RequestParam @Email String email,
                                 @RequestParam @NotBlank String password,
                                 Model model) {
        authService.registerUser(name, email, password, "STUDENT");
        model.addAttribute("registered", true);
        return "auth/login";
    }

    // Remove manual login handling; Spring Security handles POST /auth/login
}


