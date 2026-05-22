package com.tutormatch.service;

import com.tutormatch.domain.Estudiante;
import com.tutormatch.domain.Tutor;
import com.tutormatch.dto.*;
import com.tutormatch.repository.EstudianteRepository;
import com.tutormatch.repository.TutorRepository;
import com.tutormatch.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EstudianteRepository estudianteRepo;
    private final TutorRepository tutorRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest req) {
        var estudiante = estudianteRepo.findByEmail(req.getEmail());
        if (estudiante.isPresent()) {
            Estudiante e = estudiante.get();
            if (!encoder.matches(req.getPassword(), e.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
            }
            return new AuthResponse(
                jwtUtil.generateToken(e.getId(), "ESTUDIANTE"),
                "ESTUDIANTE", e.getId(), e.getNombre(), e.getEmail(),
                e.isOnboardingCompleto()
            );
        }

        var tutor = tutorRepo.findByEmail(req.getEmail());
        if (tutor.isPresent()) {
            Tutor t = tutor.get();
            if (!encoder.matches(req.getPassword(), t.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
            }
            return new AuthResponse(
                jwtUtil.generateToken(t.getId(), "TUTOR"),
                "TUTOR", t.getId(), t.getNombre(), t.getEmail(),
                true
            );
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado");
    }

    public AuthResponse registerEstudiante(RegisterEstudianteRequest req) {
        if (estudianteRepo.existsByEmail(req.getEmail()) || tutorRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
        Estudiante e = new Estudiante();
        e.setNombre(req.getNombre());
        e.setEmail(req.getEmail());
        e.setPassword(encoder.encode(req.getPassword()));
        e.setCarrera(req.getCarrera());
        e.setSemestre(req.getSemestre());
        e.setOnboardingCompleto(false);
        e = estudianteRepo.save(e);
        return new AuthResponse(
            jwtUtil.generateToken(e.getId(), "ESTUDIANTE"),
            "ESTUDIANTE", e.getId(), e.getNombre(), e.getEmail(),
            false
        );
    }

    public AuthResponse registerTutor(RegisterTutorRequest req) {
        if (estudianteRepo.existsByEmail(req.getEmail()) || tutorRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
        Tutor t = new Tutor();
        t.setNombre(req.getNombre());
        t.setEmail(req.getEmail());
        t.setPassword(encoder.encode(req.getPassword()));
        t.setExperiencia(req.getExperiencia());
        t.setCarrera(req.getCarrera());
        t.setSemestre(req.getSemestre());
        t.setRating(0.0);
        t = tutorRepo.save(t);
        return new AuthResponse(
            jwtUtil.generateToken(t.getId(), "TUTOR"),
            "TUTOR", t.getId(), t.getNombre(), t.getEmail(),
            true
        );
    }
}
