package com.tutormatch.repository;

import com.tutormatch.domain.Horario;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface HorarioRepository extends Neo4jRepository<Horario, Long> {}
