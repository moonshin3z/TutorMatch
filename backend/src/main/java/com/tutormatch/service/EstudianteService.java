package com.tutormatch.service;

import com.tutormatch.domain.Estudiante;
import com.tutormatch.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.neo4j.core.Neo4jClient;
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
    private final Neo4jClient neo4jClient;

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

    public void actualizarBusqueda(Long estudianteId, List<String> cursoCodigos,
                                    List<Long> horarioIds, String nivelNombre, String modalidad) {
        // Elimina relaciones de búsqueda existentes para reemplazarlas en bloque
        neo4jClient.query("""
            MATCH (e:Estudiante) WHERE id(e) = $eId
            OPTIONAL MATCH (e)-[r:TOMA]->() DELETE r
            WITH e
            OPTIONAL MATCH (e)-[s:LIBRE_EN]->() DELETE s
            WITH e
            OPTIONAL MATCH (e)-[t:BUSCA_NIVEL]->() DELETE t
            """).bind(estudianteId).to("eId").run();

        Estudiante e = obtener(estudianteId);

        e.getCursos().clear();
        cursoCodigos.stream()
                .map(cursoRepo::findById)
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .forEach(c -> e.getCursos().add(c));

        e.getHorarios().clear();
        horarioIds.stream()
                .map(horarioRepo::findById)
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .forEach(h -> e.getHorarios().add(h));

        if (nivelNombre != null && !nivelNombre.isBlank()) {
            nivelRepo.findByNombre(nivelNombre).ifPresent(e::setNivelBuscado);
        }
        if (modalidad != null) e.setModalidadPreferida(modalidad);

        estudianteRepo.save(e);
    }

    public void actualizarPerfil(Long estudianteId, String carrera, Integer semestre) {
        Estudiante e = obtener(estudianteId);
        if (carrera != null && !carrera.isBlank()) e.setCarrera(carrera);
        if (semestre != null && semestre >= 1) e.setSemestre(semestre);
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
