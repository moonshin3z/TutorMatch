package com.tutormatch.service;

import com.tutormatch.dto.GraphDTO;
import com.tutormatch.dto.GraphDTO.GraphEdge;
import com.tutormatch.dto.GraphDTO.GraphNode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GrafoService {

    private final Neo4jClient neo4jClient;

    /**
     * Devuelve el grafo de conexiones del estudiante:
     *   Estudiante --TOMA--> Cursos <--ENSENA-- Tutores
     *   Estudiante --RECOMIENDA--> Tutores
     *
     * Formato listo para renderizar con force-directed layout en el frontend.
     */
    public GraphDTO getGrafoEstudiante(Long estudianteId) {
        LinkedHashMap<String, GraphNode> nodeMap = new LinkedHashMap<>();
        Set<String> edgeKeys = new HashSet<>();
        List<GraphEdge> edges = new ArrayList<>();

        // ── Query 1: estudiante → cursos → tutores ───────────────────────────
        neo4jClient.query("""
            MATCH (e:Estudiante) WHERE id(e) = $eId
            OPTIONAL MATCH (e)-[:TOMA]->(c:Curso)
            OPTIONAL MATCH (c)<-[:ENSENA]-(t:Tutor)
            RETURN
              id(e) AS eId, e.nombre AS eName,
              id(c) AS cId, c.codigo AS cCode,
              id(t) AS tId, t.nombre AS tName
            """)
                .bind(estudianteId).to("eId")
                .fetch().all()
                .forEach(row -> {
                    String eId = str(row.get("eId"));
                    nodeMap.putIfAbsent(eId,
                            new GraphNode(eId, shortName((String) row.get("eName")), "estudiante"));

                    if (row.get("cId") != null) {
                        String cId = str(row.get("cId"));
                        nodeMap.putIfAbsent(cId,
                                new GraphNode(cId, (String) row.get("cCode"), "curso"));
                        addEdge(edges, edgeKeys, eId, cId, "TOMA");

                        if (row.get("tId") != null) {
                            String tId = str(row.get("tId"));
                            nodeMap.putIfAbsent(tId,
                                    new GraphNode(tId, shortName((String) row.get("tName")), "tutor"));
                            addEdge(edges, edgeKeys, tId, cId, "ENSENA");
                        }
                    }
                });

        // ── Query 2: estudiante → RECOMIENDA → tutores ───────────────────────
        neo4jClient.query("""
            MATCH (e:Estudiante)-[r:RECOMIENDA]->(t:Tutor) WHERE id(e) = $eId
            RETURN id(t) AS tId, t.nombre AS tName
            """)
                .bind(estudianteId).to("eId")
                .fetch().all()
                .forEach(row -> {
                    if (row.get("tId") != null) {
                        String eId = String.valueOf(estudianteId);
                        String tId = str(row.get("tId"));
                        nodeMap.putIfAbsent(tId,
                                new GraphNode(tId, shortName((String) row.get("tName")), "tutor"));
                        addEdge(edges, edgeKeys, eId, tId, "RECOMIENDA");
                    }
                });

        return new GraphDTO(new ArrayList<>(nodeMap.values()), edges);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void addEdge(List<GraphEdge> edges, Set<String> keys,
                         String source, String target, String type) {
        String key = source + "_" + target + "_" + type;
        if (keys.add(key)) {
            edges.add(new GraphEdge(source, target, type));
        }
    }

    /** Primer nombre o primeras dos palabras — evita que el grafo se llene con nombres largos */
    private String shortName(String nombre) {
        if (nombre == null) return "?";
        String[] parts = nombre.trim().split("\\s+");
        return parts.length == 1 ? parts[0] : parts[0] + " " + parts[1].charAt(0) + ".";
    }

    private String str(Object o) {
        if (o == null) return "";
        if (o instanceof Number n) return String.valueOf(n.longValue());
        return o.toString();
    }
}
