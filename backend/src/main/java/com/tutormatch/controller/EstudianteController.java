package com.tutormatch.controller;

import com.tutormatch.domain.Estudiante;
import com.tutormatch.service.EstudianteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/estudiantes")
@RequiredArgsConstructor
public class EstudianteController {

    private final EstudianteService service;

    @GetMapping
    public ResponseEntity<List<Estudiante>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Estudiante> obtener(@PathVariable Long id) {
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

    @PutMapping("/{id}/onboarding")
    public ResponseEntity<Void> completarOnboarding(@PathVariable Long id,
                                                     @RequestBody Map<String, Object> body) {
        String modalidad = (String) body.get("modalidadPreferida");
        service.completarOnboarding(id, modalidad);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
