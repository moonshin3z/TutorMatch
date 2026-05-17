package com.tutormatch.service;

import com.tutormatch.domain.Estudiante;
import com.tutormatch.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EstudianteService {

    private final EstudianteRepository estudianteRepo;
    private final CursoRepository cursoRepo;
    private final HorarioRepository horarioRepo;
    private final NivelRepository nivelRepo;

    public List<Estudiante> listarTodos() {
        return estudianteRepo.findAll();
    }

    public Estudiante obtener(Long id) {
        return estudianteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no encontrado"));
    }

    public void agregarCurso(Long estudianteId, String codigoCurso) {
        Estudiante e = obtener(estudianteId);
        var curso = cursoRepo.findById(codigoCurso)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));
        boolean yaExiste = e.getCursos().stream().anyMatch(c -> c.getCodigo().equals(codigoCurso));
        if (!yaExiste) {
            e.getCursos().add(curso);
            estudianteRepo.save(e);
        }
    }

    public void eliminarCurso(Long estudianteId, String codigoCurso) {
        Estudiante e = obtener(estudianteId);
        e.getCursos().removeIf(c -> c.getCodigo().equals(codigoCurso));
        estudianteRepo.save(e);
    }

    public void agregarHorario(Long estudianteId, Long horarioId) {
        Estudiante e = obtener(estudianteId);
        var horario = horarioRepo.findById(horarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horario no encontrado"));
        boolean yaExiste = e.getHorarios().stream().anyMatch(h -> h.getId().equals(horarioId));
        if (!yaExiste) {
            e.getHorarios().add(horario);
            estudianteRepo.save(e);
        }
    }

    public void eliminarHorario(Long estudianteId, Long horarioId) {
        Estudiante e = obtener(estudianteId);
        e.getHorarios().removeIf(h -> h.getId().equals(horarioId));
        estudianteRepo.save(e);
    }

    public void setNivel(Long estudianteId, String nivelNombre) {
        Estudiante e = obtener(estudianteId);
        var nivel = nivelRepo.findByNombre(nivelNombre)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nivel no encontrado"));
        e.setNivelBuscado(nivel);
        estudianteRepo.save(e);
    }

    public void completarOnboarding(Long estudianteId, String modalidadPreferida) {
        Estudiante e = obtener(estudianteId);
        e.setOnboardingCompleto(true);
        if (modalidadPreferida != null) e.setModalidadPreferida(modalidadPreferida);
        estudianteRepo.save(e);
    }

    public void eliminar(Long id) {
        obtener(id);
        estudianteRepo.deleteById(id);
    }
}
