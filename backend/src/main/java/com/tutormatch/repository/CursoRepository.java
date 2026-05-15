package com.tutormatch.repository;

import com.tutormatch.domain.Curso;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface CursoRepository extends Neo4jRepository<Curso, String> {}
