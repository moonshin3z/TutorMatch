package com.tutormatch.controller;

import com.tutormatch.dto.RecomendacionDTO;
import com.tutormatch.dto.TutorGuardadoDTO;
import com.tutormatch.service.RecomendacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recomendaciones")
@RequiredArgsConstructor
public class RecomendacionController {

    private final RecomendacionService service;

    @GetMapping("/{estudianteId}")
    public ResponseEntity<List<RecomendacionDTO>> recomendar(@PathVariable Long estudianteId) {
        return ResponseEntity.ok(service.recomendar(estudianteId));
    }

    @PostMapping("/{estudianteId}/recomendar/{tutorId}")
    public ResponseEntity<Void> marcarRecomendacion(
            @PathVariable Long estudianteId,
            @PathVariable Long tutorId) {
        service.marcarRecomendado(estudianteId, tutorId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{estudianteId}/guardados")
    public ResponseEntity<List<TutorGuardadoDTO>> listarGuardados(
            @PathVariable Long estudianteId) {
        return ResponseEntity.ok(service.listarGuardados(estudianteId));
    }

    @GetMapping("/{estudianteId}/sesion/{tutorId}")
    public ResponseEntity<java.util.Map<String, Object>> getSesionEstado(
            @PathVariable Long estudianteId,
            @PathVariable Long tutorId) {
        String estado = service.getSesionEstado(estudianteId, tutorId);
        return ResponseEntity.ok(java.util.Map.of("estado", estado != null ? estado : "NINGUNA"));
    }

    @PutMapping("/{estudianteId}/completar/{tutorId}")
    public ResponseEntity<Void> completarTutoria(
            @PathVariable Long estudianteId,
            @PathVariable Long tutorId) {
        service.completarTutoria(estudianteId, tutorId);
        return ResponseEntity.ok().build();
    }
}
