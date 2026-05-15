package com.tutormatch.controller;

import com.tutormatch.dto.*;
import com.tutormatch.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register/estudiante")
    public ResponseEntity<AuthResponse> registerEstudiante(@Valid @RequestBody RegisterEstudianteRequest req) {
        return ResponseEntity.ok(authService.registerEstudiante(req));
    }

    @PostMapping("/register/tutor")
    public ResponseEntity<AuthResponse> registerTutor(@Valid @RequestBody RegisterTutorRequest req) {
        return ResponseEntity.ok(authService.registerTutor(req));
    }
}
