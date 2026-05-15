package com.tutormatch.repository;

import com.tutormatch.domain.Estudiante;
import org.springframework.data.neo4j.repository.Neo4jRepository;

import java.util.Optional;

public interface EstudianteRepository extends Neo4jRepository<Estudiante, Long> {
    Optional<Estudiante> findByEmail(String email);
    boolean existsByEmail(String email);
}
