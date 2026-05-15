package com.tutormatch.repository;

import com.tutormatch.domain.Nivel;
import org.springframework.data.neo4j.repository.Neo4jRepository;

import java.util.Optional;

public interface NivelRepository extends Neo4jRepository<Nivel, Long> {
    Optional<Nivel> findByNombre(String nombre);
}
