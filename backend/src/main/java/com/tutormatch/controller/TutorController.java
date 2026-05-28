package com.tutormatch.controller;

import com.tutormatch.domain.Tutor;
import com.tutormatch.dto.EstudianteSolicitudDTO;
import com.tutormatch.dto.ReviewRequest;
import com.tutormatch.dto.ReviewResponse;
import com.tutormatch.service.TutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutores")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService service;

    @GetMapping
    public ResponseEntity<List<Tutor>> listar(
            @RequestParam(required = false) String materia,
            @RequestParam(required = false) String nivel,
            @RequestParam(required = false) String modalidad,
            @RequestParam(required = false) String dia) {
        if (materia == null && nivel == null && modalidad == null && dia == null) {
            return ResponseEntity.ok(service.listarTodos());
        }
        return ResponseEntity.ok(service.listarConFiltros(materia, nivel, modalidad, dia));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tutor> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtener(id));
    }

    @PutMapping("/{id}/cursos")
    public ResponseEntity<Void> agregarCurso(@PathVariable Long id,
                                              @RequestBody Map<String, String> body) {
        service.agregarCurso(id, body.get("codigo"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/cursos/{codigo}")
    public ResponseEntity<Void> eliminarCurso(@PathVariable Long id,
                                               @PathVariable String codigo) {
        service.eliminarCurso(id, codigo);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/horarios")
    public ResponseEntity<Void> agregarHorario(@PathVariable Long id,
                                                @RequestBody Map<String, Long> body) {
        service.agregarHorario(id, body.get("horarioId"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/horarios/{horarioId}")
    public ResponseEntity<Void> eliminarHorario(@PathVariable Long id,
                                                 @PathVariable Long horarioId) {
        service.eliminarHorario(id, horarioId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/nivel")
    public ResponseEntity<Void> setNivel(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        service.setNivel(id, body.get("nivel"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/perfil")
    public ResponseEntity<Void> actualizarPerfil(@PathVariable Long id,
                                                   @RequestBody Map<String, Object> body) {
        String bio      = (String) body.get("bio");
        Double precio   = body.get("precio") != null ? ((Number) body.get("precio")).doubleValue() : null;
        String modalidad = (String) body.get("modalidad");
        service.actualizarPerfil(id, bio, precio, modalidad);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ── Reviews ───────────────────────────────────────────────────────────────

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Void> agregarReview(@PathVariable Long id,
                                               @Valid @RequestBody ReviewRequest req,
                                               Authentication auth) {
        Long estudianteId = (Long) auth.getPrincipal();
        service.agregarReview(id, estudianteId, req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> listarReviews(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarReviews(id));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> stats(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStats(id));
    }

    @GetMapping("/{id}/solicitudes")
    public ResponseEntity<List<EstudianteSolicitudDTO>> solicitudes(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarSolicitudes(id));
    }
}
