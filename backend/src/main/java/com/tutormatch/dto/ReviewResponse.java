package com.tutormatch.dto;

import lombok.Data;

@Data
public class ReviewResponse {
    private String texto;
    private double calificacion;
    private String nombreReviewer;
    private String carreraReviewer;
    private int semestreReviewer;
    private String fecha;
}
