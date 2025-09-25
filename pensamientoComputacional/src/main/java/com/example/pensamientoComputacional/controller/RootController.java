package com.example.pensamientoComputacional.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/health")
    public String health() {
        return "forward:/";
    }
}


