package com.tutormatch.service;

import com.tutormatch.domain.Tutor;
import com.tutormatch.dto.ReviewRequest;
import com.tutormatch.dto.ReviewResponse;
import com.tutormatch.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TutorService {

    private final TutorRepository tutorRepo;
    private final CursoRepository cursoRepo;
    private final HorarioRepository horarioRepo;
    private final NivelRepository nivelRepo;
    private final Neo4jClient neo4jClient;

    // ── Consultas ─────────────────────────────────────────────────────────────

    public List<Tutor> listarTodos() {
        return tutorRepo.findAll();
    }

    public List<Tutor> listarConFiltros(String materia, String nivel, String modalidad, String dia) {
        return tutorRepo.findAll().stream()
                .filter(t -> materia == null || t.getCursos().stream()
                        .anyMatch(c -> c.getCodigo().equalsIgnoreCase(materia)))
                .filter(t -> nivel == null || (t.getNivel() != null
                        && t.getNivel().getNombre().equalsIgnoreCase(nivel)))
                .filter(t -> modalidad == null || t.getModalidad() == null
                        || t.getModalidad().equalsIgnoreCase(modalidad)
                        || "AMBAS".equalsIgnoreCase(t.getModalidad()))
                .filter(t -> dia == null || t.getHorarios().stream()
                        .anyMatch(h -> h.getDia().equalsIgnoreCase(dia)))
                .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                .collect(Collectors.toList());
    }

    public Tutor obtener(Long id) {
        return tutorRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor no encontrado"));
    }

    // ── Cursos ────────────────────────────────────────────────────────────────

    public void agregarCurso(Long tutorId, String codigoCurso) {
        Tutor t = obtener(tutorId);
        var curso = cursoRepo.findById(codigoCurso)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));
        if (t.getCursos().stream().noneMatch(c -> c.getCodigo().equals(codigoCurso))) {
            t.getCursos().add(curso);
            tutorRepo.save(t);
        }
    }

    public void eliminarCurso(Long tutorId, String codigoCurso) {
        Tutor t = obtener(tutorId);
        t.getCursos().removeIf(c -> c.getCodigo().equals(codigoCurso));
        tutorRepo.save(t);
    }

    // ── Horarios ──────────────────────────────────────────────────────────────

    public void agregarHorario(Long tutorId, Long horarioId) {
        Tutor t = obtener(tutorId);
        var horario = horarioRepo.findById(horarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horario no encontrado"));
        if (t.getHorarios().stream().noneMatch(h -> h.getId().equals(horarioId))) {
            t.getHorarios().add(horario);
            tutorRepo.save(t);
        }
    }

    public void eliminarHorario(Long tutorId, Long horarioId) {
        Tutor t = obtener(tutorId);
        t.getHorarios().removeIf(h -> h.getId().equals(horarioId));
        tutorRepo.save(t);
    }

    // ── Nivel y perfil ────────────────────────────────────────────────────────

    public void setNivel(Long tutorId, String nivelNombre) {
        Tutor t = obtener(tutorId);
        var nivel = nivelRepo.findByNombre(nivelNombre)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nivel no encontrado"));
        t.setNivel(nivel);
        tutorRepo.save(t);
    }

    public void actualizarPerfil(Long tutorId, String bio, Double precio, String modalidad) {
        Tutor t = obtener(tutorId);
        if (bio != null)      t.setBio(bio);
        if (precio != null)   t.setPrecio(precio);
        if (modalidad != null) t.setModalidad(modalidad);
        tutorRepo.save(t);
    }

    public void eliminar(Long id) {
        obtener(id);
        tutorRepo.deleteById(id);
    }

    // ── Reviews ───────────────────────────────────────────────────────────────

    public void agregarReview(Long tutorId, Long estudianteId, ReviewRequest req) {
        // Verifica que el tutor existe
        obtener(tutorId);

        String crearReview = """
            MATCH (e:Estudiante) WHERE id(e) = $eId
            MATCH (t:Tutor)      WHERE id(t) = $tId
            MERGE (e)-[r:DEJO_REVIEW {tutorId: $tId}]->(t)
            SET r.texto       = $texto,
                r.calificacion = $cal,
                r.fecha        = $fecha
            """;
        neo4jClient.query(crearReview)
                .bind(estudianteId).to("eId")
                .bind(tutorId).to("tId")
                .bind(req.getTexto()).to("texto")
                .bind((double) req.getCalificacion()).to("cal")
                .bind(LocalDate.now().toString()).to("fecha")
                .run();

        // Recalcula rating promedio y total de reviews en el nodo Tutor
        String recalcular = """
            MATCH ()-[r:DEJO_REVIEW]->(t:Tutor) WHERE id(t) = $tId
            WITH t, avg(r.calificacion) AS avg, count(r) AS total
            SET t.rating = round(avg * 10) / 10.0,
                t.totalReviews = total
            """;
        neo4jClient.query(recalcular)
                .bind(tutorId).to("tId")
                .run();
    }

    @SuppressWarnings("unchecked")
    public List<ReviewResponse> listarReviews(Long tutorId) {
        obtener(tutorId);

        String cypher = """
            MATCH (e:Estudiante)-[r:DEJO_REVIEW]->(t:Tutor) WHERE id(t) = $tId
            RETURN e.nombre   AS nombreReviewer,
                   e.carrera  AS carreraReviewer,
                   e.semestre AS semestreReviewer,
                   r.texto        AS texto,
                   r.calificacion AS calificacion,
                   r.fecha        AS fecha
            ORDER BY r.fecha DESC
            """;

        return neo4jClient.query(cypher)
                .bind(tutorId).to("tId")
                .fetch()
                .all()
                .stream()
                .map(this::mapReview)
                .toList();
    }

    private ReviewResponse mapReview(Map<String, Object> row) {
        ReviewResponse r = new ReviewResponse();
        r.setNombreReviewer((String) row.get("nombreReviewer"));
        r.setCarreraReviewer((String) row.get("carreraReviewer"));
        r.setSemestreReviewer(row.get("semestreReviewer") != null
                ? ((Number) row.get("semestreReviewer")).intValue() : 0);
        r.setTexto((String) row.get("texto"));
        r.setCalificacion(row.get("calificacion") != null
                ? ((Number) row.get("calificacion")).doubleValue() : 0.0);
        r.setFecha((String) row.get("fecha"));
        return r;
    }
}
