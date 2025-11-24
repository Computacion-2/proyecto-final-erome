package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.service.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
@Tag(name = "Images", description = "Gestión de imágenes y fotos de perfil")
@SecurityRequirement(name = "bearerAuth")
public class ImageUploadRestController {

    @Autowired
    private S3Service s3Service;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Subir imagen", description = "Sube una imagen de perfil a S3")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Imagen subida exitosamente"),
            @ApiResponse(responseCode = "400", description = "Archivo inválido"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String key = s3Service.uploadImage(file);
            String presignedUrl = s3Service.getPresignedUrl(key);
            
            Map<String, String> response = new HashMap<>();
            response.put("key", key);
            response.put("url", presignedUrl);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{key}")
    @Operation(summary = "Obtener URL de imagen", description = "Obtiene una URL presignada para acceder a una imagen")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL obtenida exitosamente"),
            @ApiResponse(responseCode = "404", description = "Imagen no encontrada"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<Map<String, String>> getImageUrl(@PathVariable String key) {
        try {
            String presignedUrl = s3Service.getPresignedUrl(key);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", presignedUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{key}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Eliminar imagen", description = "Elimina una imagen de S3")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Imagen eliminada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Imagen no encontrada"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<Void> deleteImage(@PathVariable String key) {
        try {
            s3Service.deleteImage(key);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

