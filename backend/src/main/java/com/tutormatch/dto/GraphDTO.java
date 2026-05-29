package com.tutormatch.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GraphDTO {

    private List<GraphNode> nodes;
    private List<GraphEdge> edges;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GraphNode {
        private String id;
        private String label;
        private String type;   // estudiante | tutor | curso
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GraphEdge {
        private String source;
        private String target;
        private String type;   // TOMA | ENSENA | RECOMIENDA
    }
}
