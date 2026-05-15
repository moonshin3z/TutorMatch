package com.tutormatch.controller;

import com.tutormatch.domain.Curso;
import com.tutormatch.domain.Horario;
import com.tutormatch.domain.Nivel;
import com.tutormatch.repository.CursoRepository;
import com.tutormatch.repository.HorarioRepository;
import com.tutormatch.repository.NivelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DataController {

    private final CursoRepository cursoRepo;
    private final HorarioRepository horarioRepo;
    private final NivelRepository nivelRepo;

    @GetMapping("/cursos")
    public ResponseEntity<List<Curso>> cursos() {
        return ResponseEntity.ok(cursoRepo.findAll());
    }

    @GetMapping("/horarios")
    public ResponseEntity<List<Horario>> horarios() {
        return ResponseEntity.ok(horarioRepo.findAll());
    }

    @GetMapping("/niveles")
    public ResponseEntity<List<Nivel>> niveles() {
        return ResponseEntity.ok(nivelRepo.findAll());
    }
}
