package com.tutormatch.service;

import com.tutormatch.dto.RecomendacionDTO;
import com.tutormatch.dto.TutorGuardadoDTO;
import com.tutormatch.repository.EstudianteRepository;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecomendacionService {

    private final Neo4jClient neo4jClient;
    private final EstudianteRepository estudianteRepo;

    public List<RecomendacionDTO> recomendar(Long estudianteId) {
        if (!estudianteRepo.existsById(estudianteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no encontrado");
        }

        // Cypher que calcula el score y retorna todos los datos necesarios
        // para generar razones de match en lenguaje natural en Java.
        String cypher = """
            MATCH (e:Estudiante) WHERE id(e) = $eId
            MATCH (e)-[:TOMA]->(c:Curso)<-[:ENSENA]-(t:Tutor)
            WITH e, t, collect(DISTINCT c) AS cursos_match
            MATCH (e)-[:LIBRE_EN]->(h:Horario)<-[:DISPONIBLE_EN]-(t)
            WITH e, t, cursos_match, collect(DISTINCT h) AS horarios_comunes
            WHERE size(horarios_comunes) > 0
            OPTIONAL MATCH (e)-[:BUSCA_NIVEL]->(nb:Nivel)
            OPTIONAL MATCH (t)-[:TIENE_NIVEL]->(nt:Nivel)
            OPTIONAL MATCH (t)<-[:RECOMIENDA]-(e2:Estudiante)-[:TOMA]->(c2:Curso)
            WHERE c2 IN cursos_match AND e2 <> e
            WITH e, t, cursos_match, horarios_comunes, nb, nt, count(DISTINCT e2) AS recs
            WITH e, t, cursos_match, horarios_comunes, nb, nt, recs,
                 (size(cursos_match) * 5
                  + 3
                  + CASE
                      WHEN nt IS NOT NULL AND nb IS NOT NULL AND nt.valor > nb.valor THEN 3
                      WHEN nt IS NOT NULL AND nb IS NOT NULL AND nt.valor = nb.valor THEN 1
                      ELSE 0
                    END
                  + CASE
                      WHEN t.rating >= 4.5 THEN 2
                      WHEN t.rating >= 4.0 THEN 1
                      ELSE 0
                    END
                  + CASE WHEN recs > 3 THEN 3 ELSE recs END
                  + CASE
                      WHEN t.carrera IS NOT NULL AND e.carrera IS NOT NULL
                           AND t.carrera = e.carrera THEN 2
                      ELSE 0
                    END
                 ) AS score
            RETURN
              id(t)                                                                AS id,
              t.nombre                                                              AS nombre,
              coalesce(t.rating, 0.0)                                              AS rating,
              coalesce(t.experiencia, 0)                                           AS experiencia,
              coalesce(nt.nombre, 'No especificado')                               AS nivel,
              coalesce(nb.nombre, '')                                               AS nivelBuscado,
              [c IN cursos_match | c.nombre]                                       AS cursos,
              [c IN cursos_match | c.codigo]                                       AS cursosCodigos,
              [h IN horarios_comunes | h.dia + ' ' + h.horaInicio + '-' + h.horaFin] AS horarios,
              coalesce(t.bio, '')                                                   AS bio,
              coalesce(t.precio, 0.0)                                              AS precio,
              coalesce(t.modalidad, 'PRESENCIAL')                                  AS modalidad,
              coalesce(t.fotoUrl, '')                                               AS fotoUrl,
              coalesce(t.carrera, '')                                               AS carreraT,
              coalesce(t.semestre, 0)                                              AS semestreT,
              coalesce(t.email, '')                                                 AS emailT,
              coalesce(t.totalReviews, 0)                                          AS totalReviews,
              coalesce(e.modalidadPreferida, '')                                   AS modalidadPreferida,
              recs,
              score
            ORDER BY score DESC
            LIMIT 10
            """;

        return neo4jClient.query(cypher)
                .bind(estudianteId).to("eId")
                .fetch()
                .all()
                .stream()
                .map(this::mapRow)
                .toList();
    }

    // Guarda el tutor con estado PENDIENTE y fecha — usa ON CREATE/ON MATCH
    // para no sobreescribir si ya existe la relación
    public void marcarRecomendado(Long estudianteId, Long tutorId) {
        String cypher = """
            MATCH (e:Estudiante) WHERE id(e) = $eId
            MATCH (t:Tutor)      WHERE id(t) = $tId
            MERGE (e)-[r:RECOMIENDA]->(t)
            ON CREATE SET r.estado = 'PENDIENTE', r.fecha = $fecha
            ON MATCH  SET r.estado = coalesce(r.estado, 'PENDIENTE'),
                          r.fecha  = coalesce(r.fecha,  $fecha)
            """;
        neo4jClient.query(cypher)
                .bind(estudianteId).to("eId")
                .bind(tutorId).to("tId")
                .bind(LocalDate.now().toString()).to("fecha")
                .run();
    }

    // Cambia la relación RECOMIENDA a COMPLETADO — habilita dejar reseña
    public void completarTutoria(Long estudianteId, Long tutorId) {
        String cypher = """
            MATCH (e:Estudiante)-[r:RECOMIENDA]->(t:Tutor)
            WHERE id(e) = $eId AND id(t) = $tId
            SET r.estado = 'COMPLETADO', r.fechaCompletado = $fecha
            """;
        neo4jClient.query(cypher)
                .bind(estudianteId).to("eId")
                .bind(tutorId).to("tId")
                .bind(LocalDate.now().toString()).to("fecha")
                .run();
    }

    // Lista los tutores guardados por el estudiante con su estado
    @SuppressWarnings("unchecked")
    public List<TutorGuardadoDTO> listarGuardados(Long estudianteId) {
        String cypher = """
            MATCH (e:Estudiante)-[r:RECOMIENDA]->(t:Tutor)
            WHERE id(e) = $eId
            OPTIONAL MATCH (t)-[:ENSENA]->(c:Curso)
            WITH t, r, collect(c.nombre) AS cursos
            RETURN
              id(t)                              AS id,
              t.nombre                           AS nombre,
              coalesce(t.carrera, '')            AS carrera,
              coalesce(t.semestre, 0)            AS semestre,
              coalesce(t.email, '')              AS email,
              coalesce(t.rating, 0.0)            AS rating,
              coalesce(t.precio, 0.0)            AS precio,
              coalesce(t.modalidad, '')          AS modalidad,
              cursos,
              coalesce(r.estado, 'PENDIENTE')    AS estado,
              coalesce(r.fecha, '')              AS fecha
            ORDER BY r.fecha DESC
            """;
        return neo4jClient.query(cypher)
                .bind(estudianteId).to("eId")
                .fetch()
                .all()
                .stream()
                .map(this::mapGuardado)
                .toList();
    }

    private TutorGuardadoDTO mapGuardado(Map<String, Object> row) {
        TutorGuardadoDTO dto = new TutorGuardadoDTO();
        dto.setId(toLong(row.get("id")));
        dto.setNombre((String) row.get("nombre"));
        dto.setCarrera((String) row.get("carrera"));
        dto.setSemestre(toInt(row.get("semestre")));
        dto.setEmail((String) row.get("email"));
        dto.setRating(toDouble(row.get("rating")));
        dto.setPrecio(toDouble(row.get("precio")));
        dto.setModalidad((String) row.get("modalidad"));
        dto.setCursos((List<String>) row.get("cursos"));
        dto.setEstado((String) row.get("estado"));
        dto.setFecha((String) row.get("fecha"));
        return dto;
    }

    // ── Mapeo de fila Cypher → DTO ────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private RecomendacionDTO mapRow(Map<String, Object> row) {
        RecomendacionDTO dto = new RecomendacionDTO();
        dto.setId(toLong(row.get("id")));
        dto.setNombre((String) row.get("nombre"));
        dto.setRating(toDouble(row.get("rating")));
        dto.setExperiencia(toInt(row.get("experiencia")));
        dto.setNivel((String) row.get("nivel"));
        dto.setBio((String) row.get("bio"));
        dto.setPrecio(toDouble(row.get("precio")));
        dto.setModalidad((String) row.get("modalidad"));
        dto.setFotoUrl((String) row.get("fotoUrl"));
        dto.setCarrera((String) row.get("carreraT"));
        dto.setSemestre(toInt(row.get("semestreT")));
        dto.setEmailTutor((String) row.get("emailT"));
        dto.setTotalReviews(toInt(row.get("totalReviews")));

        List<String> cursos        = (List<String>) row.get("cursos");
        List<String> cursosCodigos = (List<String>) row.get("cursosCodigos");
        List<String> horarios      = (List<String>) row.get("horarios");
        dto.setCursos(cursos);
        dto.setCursosCodigos(cursosCodigos);
        dto.setHorarios(horarios);
        dto.setScore(toInt(row.get("score")));

        dto.setMatchReasons(buildMatchReasons(
                cursos,
                horarios,
                (String) row.get("nivel"),
                (String) row.get("nivelBuscado"),
                toDouble(row.get("rating")),
                toLong(row.get("recs")),
                (String) row.get("modalidad"),
                (String) row.get("modalidadPreferida")
        ));

        return dto;
    }

    // ── Razones de match en lenguaje natural ─────────────────────────────────
    // Aquí brilla el grafo: cada razón es una conexión real, no un % vacío.

    private List<String> buildMatchReasons(
            List<String> cursos,
            List<String> horarios,
            String nivelTutor,
            String nivelBuscado,
            double rating,
            long recs,
            String modalidad,
            String modalidadPreferida) {

        List<String> reasons = new ArrayList<>();

        // Cursos compartidos
        if (cursos != null && !cursos.isEmpty()) {
            if (cursos.size() == 1) {
                reasons.add("Enseña " + cursos.get(0));
            } else {
                reasons.add("Enseña " + cursos.get(0) + " y " + (cursos.size() - 1) + " curso(s) más que necesitas");
            }
        }

        // Horario compatible
        if (horarios != null && !horarios.isEmpty()) {
            String primerHorario = horarios.get(0);
            reasons.add("Disponible " + primerHorario.toLowerCase());
            if (horarios.size() > 1) {
                reasons.add("+" + (horarios.size() - 1) + " horario(s) más en común");
            }
        }

        // Nivel del tutor vs lo que busca el estudiante
        if (nivelTutor != null && nivelBuscado != null && !nivelBuscado.isEmpty()) {
            Map<String, Integer> rank = Map.of("Básico", 1, "Intermedio", 2, "Avanzado", 3);
            int vt = rank.getOrDefault(nivelTutor, 0);
            int vb = rank.getOrDefault(nivelBuscado, 0);
            if (vt > vb) {
                reasons.add("Nivel " + nivelTutor.toLowerCase() + " — por encima de lo que buscas");
            } else if (vt == vb) {
                reasons.add("Nivel " + nivelTutor.toLowerCase() + " — exactamente lo que buscas");
            }
        }

        // Rating destacado
        if (rating >= 4.5) {
            reasons.add(String.format("%.1f ★ — calificación excelente", rating));
        } else if (rating >= 4.0) {
            reasons.add(String.format("%.1f ★ — bien calificado", rating));
        }

        // Filtrado colaborativo
        if (recs == 1) {
            reasons.add("Recomendado por 1 estudiante con cursos similares");
        } else if (recs > 1) {
            reasons.add("Recomendado por " + recs + " estudiantes con cursos similares");
        }

        // Modalidad preferida
        if (modalidad != null && modalidadPreferida != null && !modalidadPreferida.isEmpty()) {
            if (modalidad.equals(modalidadPreferida)) {
                String m = "VIRTUAL".equals(modalidadPreferida) ? "virtual" : "presencial";
                reasons.add("Da clases en modalidad " + m);
            } else if ("AMBAS".equals(modalidad)) {
                reasons.add("Disponible presencial y virtual");
            }
        }

        return reasons;
    }

    // ── Helpers de tipo ───────────────────────────────────────────────────────

    private Long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Long l) return l;
        if (o instanceof Number n) return n.longValue();
        return Long.valueOf(o.toString());
    }

    private double toDouble(Object o) {
        if (o == null) return 0.0;
        if (o instanceof Double d) return d;
        if (o instanceof Number n) return n.doubleValue();
        return Double.parseDouble(o.toString());
    }

    private int toInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Integer i) return i;
        if (o instanceof Number n) return n.intValue();
        return Integer.parseInt(o.toString());
    }
}
