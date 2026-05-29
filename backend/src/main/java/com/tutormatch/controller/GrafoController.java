package com.tutormatch.controller;

import com.tutormatch.dto.GraphDTO;
import com.tutormatch.service.GrafoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grafo")
@RequiredArgsConstructor
public class GrafoController {

    private final GrafoService service;

    @GetMapping("/{estudianteId}")
    public ResponseEntity<GraphDTO> getGrafo(@PathVariable Long estudianteId) {
        return ResponseEntity.ok(service.getGrafoEstudiante(estudianteId));
    }
}
