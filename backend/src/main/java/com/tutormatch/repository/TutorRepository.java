package com.tutormatch.repository;

import com.tutormatch.domain.Tutor;
import org.springframework.data.neo4j.repository.Neo4jRepository;

import java.util.Optional;

public interface TutorRepository extends Neo4jRepository<Tutor, Long> {
    Optional<Tutor> findByEmail(String email);
    boolean existsByEmail(String email);
}
