package com.tutormatch.domain;

import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("Nivel")
@Data
public class Nivel {
    @Id @GeneratedValue
    private Long id;
    private String nombre;
    private int valor;
}
