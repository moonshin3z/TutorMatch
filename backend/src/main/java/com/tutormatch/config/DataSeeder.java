package com.tutormatch.config;

import com.tutormatch.domain.*;
import com.tutormatch.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final NivelRepository nivelRepo;
    private final CursoRepository cursoRepo;
    private final HorarioRepository horarioRepo;
    private final EstudianteRepository estudianteRepo;
    private final TutorRepository tutorRepo;
    private final PasswordEncoder encoder;
    private final Neo4jClient neo4jClient;

    @Override
    public void run(String... args) {
        if (tutorRepo.count() > 0) {
            // Re-seed si los tutores no tienen carrera (datos anteriores)
            boolean actualizado = tutorRepo.findAll().stream()
                    .anyMatch(t -> t.getCarrera() != null && !t.getCarrera().isEmpty());
            if (actualizado) {
                log.info("Seed actualizado encontrado. Saltando.");
                return;
            }
            log.info("Seed desactualizado detectado. Limpiando...");
            neo4jClient.query("MATCH (n) DETACH DELETE n").run();
        }

        log.info("Poblando base de datos con datos enriquecidos (Fase A)...");

        // ── Niveles ──────────────────────────────────────────────────────────
        Nivel basico     = nivelRepo.save(nivel("Básico", 1));
        Nivel intermedio = nivelRepo.save(nivel("Intermedio", 2));
        Nivel avanzado   = nivelRepo.save(nivel("Avanzado", 3));

        // ── Cursos (14) ───────────────────────────────────────────────────────
        Curso cc2003 = curso("CC2003", "Algoritmos y Estructuras de Datos",  "Ciencias de la Computación");
        Curso cc1011 = curso("CC1011", "Programación Orientada a Objetos",   "Ciencias de la Computación");
        Curso cc2005 = curso("CC2005", "Bases de Datos",                     "Ciencias de la Computación");
        Curso cc2010 = curso("CC2010", "Sistemas Operativos",                "Ciencias de la Computación");
        Curso mm1010 = curso("MM1010", "Cálculo Diferencial",                "Matemática");
        Curso mm1020 = curso("MM1020", "Cálculo Integral",                   "Matemática");
        Curso mm2040 = curso("MM2040", "Álgebra Lineal",                     "Matemática");
        Curso mm2020 = curso("MM2020", "Estadística y Probabilidad",         "Matemática");
        Curso fg1010 = curso("FG1010", "Física General",                     "Física");
        Curso fg1020 = curso("FG1020", "Física para Ingeniería",             "Física");
        Curso fq1010 = curso("FQ1010", "Química General",                    "Química");
        Curso in1010 = curso("IN1010", "Fundamentos de Ingeniería",          "Ingeniería");
        Curso in2010 = curso("IN2010", "Termodinámica",                      "Ingeniería");
        Curso ec1010 = curso("EC1010", "Principios de Economía",             "Ciencias Económicas");
        cursoRepo.saveAll(List.of(cc2003,cc1011,cc2005,cc2010,mm1010,mm1020,mm2040,mm2020,
                                  fg1010,fg1020,fq1010,in1010,in2010,ec1010));

        // ── Horarios (15) ─────────────────────────────────────────────────────
        Horario h1  = horario("Lunes",     "08:00", "10:00");
        Horario h2  = horario("Lunes",     "10:00", "12:00");
        Horario h3  = horario("Lunes",     "16:00", "18:00");
        Horario h4  = horario("Martes",    "08:00", "10:00");
        Horario h5  = horario("Martes",    "14:00", "16:00");
        Horario h6  = horario("Miércoles", "08:00", "10:00");
        Horario h7  = horario("Miércoles", "10:00", "12:00");
        Horario h8  = horario("Miércoles", "14:00", "16:00");
        Horario h9  = horario("Jueves",    "10:00", "12:00");
        Horario h10 = horario("Jueves",    "16:00", "18:00");
        Horario h11 = horario("Viernes",   "09:00", "11:00");
        Horario h12 = horario("Viernes",   "14:00", "16:00");
        Horario h13 = horario("Viernes",   "16:00", "18:00");
        Horario h14 = horario("Sábado",    "09:00", "11:00");
        Horario h15 = horario("Sábado",    "14:00", "16:00");
        List<Horario> hs = horarioRepo.saveAll(
            List.of(h1,h2,h3,h4,h5,h6,h7,h8,h9,h10,h11,h12,h13,h14,h15));
        h1=hs.get(0); h2=hs.get(1);  h3=hs.get(2);  h4=hs.get(3);  h5=hs.get(4);
        h6=hs.get(5); h7=hs.get(6);  h8=hs.get(7);  h9=hs.get(8);  h10=hs.get(9);
        h11=hs.get(10); h12=hs.get(11); h13=hs.get(12); h14=hs.get(13); h15=hs.get(14);

        // ── Tutores (7) ───────────────────────────────────────────────────────
        Tutor lilian = new Tutor();
        lilian.setNombre("Lilian Pérez"); lilian.setEmail("lilian@uvg.edu.gt");
        lilian.setPassword(encoder.encode("pass1234"));
        lilian.setCarrera("Ingeniería en Sistemas"); lilian.setSemestre(5);
        lilian.setRating(4.8); lilian.setExperiencia(5); lilian.setPrecio(80.0);
        lilian.setModalidad("AMBAS"); lilian.setTotalReviews(3);
        lilian.setBio("Ing. en Sistemas, 5to semestre. Especialista en algoritmos y estructuras. " +
                "Explico paso a paso, sin saltar pasos. Mis estudiantes suben de nota en el primer examen.");
        lilian.setCursos(List.of(cc2003, cc1011)); lilian.setHorarios(List.of(h3, h8));
        lilian.setNivel(avanzado);
        tutorRepo.save(lilian);

        Tutor pedro = new Tutor();
        pedro.setNombre("Pedro García"); pedro.setEmail("pedro@uvg.edu.gt");
        pedro.setPassword(encoder.encode("pass1234"));
        pedro.setCarrera("Ingeniería en Sistemas"); pedro.setSemestre(4);
        pedro.setRating(4.5); pedro.setExperiencia(3); pedro.setPrecio(65.0);
        pedro.setModalidad("VIRTUAL"); pedro.setTotalReviews(2);
        pedro.setBio("Ing. en Sistemas, 4to semestre. Cálculo y Algoritmos son mis fuertes. " +
                "Metodología visual: resuelvo problemas en pizarrón compartido.");
        pedro.setCursos(List.of(cc2003, mm1010)); pedro.setHorarios(List.of(h8, h9));
        pedro.setNivel(intermedio);
        tutorRepo.save(pedro);

        Tutor andrea = new Tutor();
        andrea.setNombre("Andrea López"); andrea.setEmail("andrea@uvg.edu.gt");
        andrea.setPassword(encoder.encode("pass1234"));
        andrea.setCarrera("Matemática Aplicada"); andrea.setSemestre(3);
        andrea.setRating(4.2); andrea.setExperiencia(2); andrea.setPrecio(55.0);
        andrea.setModalidad("PRESENCIAL"); andrea.setTotalReviews(1);
        andrea.setBio("Matemática Aplicada, 3er semestre. Cálculo y Álgebra sin drama. " +
                "Cualquiera puede aprender matemática con el contexto correcto.");
        andrea.setCursos(List.of(mm1010, mm1020, mm2040)); andrea.setHorarios(List.of(h3, h5));
        andrea.setNivel(intermedio);
        tutorRepo.save(andrea);

        Tutor marco = new Tutor();
        marco.setNombre("Marco Castillo"); marco.setEmail("marco@uvg.edu.gt");
        marco.setPassword(encoder.encode("pass1234"));
        marco.setCarrera("Ingeniería Civil"); marco.setSemestre(5);
        marco.setRating(4.6); marco.setExperiencia(4); marco.setPrecio(70.0);
        marco.setModalidad("AMBAS"); marco.setTotalReviews(2);
        marco.setBio("Ing. Civil, 5to semestre. Física y fundamentos desde la intuición, " +
                "no solo las fórmulas. Ex-ayudante de cátedra en FG1010.");
        marco.setCursos(List.of(fg1010, fg1020, in1010, in2010)); marco.setHorarios(List.of(h2, h10, h14));
        marco.setNivel(avanzado);
        tutorRepo.save(marco);

        Tutor carmen = new Tutor();
        carmen.setNombre("Carmen Solís"); carmen.setEmail("carmen@uvg.edu.gt");
        carmen.setPassword(encoder.encode("pass1234"));
        carmen.setCarrera("Biotecnología"); carmen.setSemestre(4);
        carmen.setRating(4.4); carmen.setExperiencia(2); carmen.setPrecio(60.0);
        carmen.setModalidad("AMBAS"); carmen.setTotalReviews(0);
        carmen.setBio("Biotecnología, 4to semestre. Química y Biología con enfoque aplicado. " +
                "Me especializo en hacer que la química no sea intimidante.");
        carmen.setCursos(List.of(fq1010, fg1010)); carmen.setHorarios(List.of(h4, h7, h15));
        carmen.setNivel(intermedio);
        tutorRepo.save(carmen);

        Tutor roberto = new Tutor();
        roberto.setNombre("Roberto Vásquez"); roberto.setEmail("roberto@uvg.edu.gt");
        roberto.setPassword(encoder.encode("pass1234"));
        roberto.setCarrera("Ingeniería en Sistemas"); roberto.setSemestre(6);
        roberto.setRating(4.7); roberto.setExperiencia(4); roberto.setPrecio(75.0);
        roberto.setModalidad("VIRTUAL"); roberto.setTotalReviews(0);
        roberto.setBio("Ing. en Sistemas, 6to semestre. Bases de datos y sistemas operativos son mis áreas. " +
                "He trabajado en proyectos reales, lo que me da perspectiva práctica para las tutorías.");
        roberto.setCursos(List.of(cc2005, cc2010, cc1011)); roberto.setHorarios(List.of(h6, h11, h13));
        roberto.setNivel(avanzado);
        tutorRepo.save(roberto);

        Tutor valentina = new Tutor();
        valentina.setNombre("Valentina Cruz"); valentina.setEmail("valentina@uvg.edu.gt");
        valentina.setPassword(encoder.encode("pass1234"));
        valentina.setCarrera("Ciencias Económicas"); valentina.setSemestre(5);
        valentina.setRating(4.3); valentina.setExperiencia(2); valentina.setPrecio(50.0);
        valentina.setModalidad("PRESENCIAL"); valentina.setTotalReviews(0);
        valentina.setBio("Economía, 5to semestre. Estadística y Economía desde casos reales. " +
                "Metodología basada en ejemplos del contexto guatemalteco.");
        valentina.setCursos(List.of(mm2020, ec1010)); valentina.setHorarios(List.of(h5, h12, h14));
        valentina.setNivel(intermedio);
        tutorRepo.save(valentina);

        // ── Estudiantes ───────────────────────────────────────────────────────
        Estudiante ana = new Estudiante();
        ana.setNombre("Ana Ramírez"); ana.setEmail("ana@uvg.edu.gt");
        ana.setPassword(encoder.encode("pass1234"));
        ana.setCarrera("Ingeniería en Sistemas"); ana.setSemestre(4);
        ana.setOnboardingCompleto(true); ana.setModalidadPreferida("AMBAS");
        ana.setCursos(List.of(cc2003)); ana.setHorarios(List.of(h3, h8));
        ana.setNivelBuscado(basico);
        estudianteRepo.save(ana);

        Estudiante carlos = new Estudiante();
        carlos.setNombre("Carlos Mendoza"); carlos.setEmail("carlos@uvg.edu.gt");
        carlos.setPassword(encoder.encode("pass1234"));
        carlos.setCarrera("Ingeniería Civil"); carlos.setSemestre(2);
        carlos.setOnboardingCompleto(true); carlos.setModalidadPreferida("PRESENCIAL");
        carlos.setCursos(List.of(mm1010, fg1010)); carlos.setHorarios(List.of(h2, h9));
        carlos.setNivelBuscado(basico);
        estudianteRepo.save(carlos);

        Estudiante maria = new Estudiante();
        maria.setNombre("María Ortiz"); maria.setEmail("maria@uvg.edu.gt");
        maria.setPassword(encoder.encode("pass1234"));
        maria.setCarrera("Ingeniería en Sistemas"); maria.setSemestre(5);
        maria.setOnboardingCompleto(true); maria.setModalidadPreferida("VIRTUAL");
        maria.setCursos(List.of(cc1011, mm2040)); maria.setHorarios(List.of(h5, h12));
        maria.setNivelBuscado(intermedio);
        estudianteRepo.save(maria);

        Estudiante diego = new Estudiante();
        diego.setNombre("Diego Torres"); diego.setEmail("diego@uvg.edu.gt");
        diego.setPassword(encoder.encode("pass1234"));
        diego.setCarrera("Ingeniería Mecánica"); diego.setSemestre(3);
        diego.setOnboardingCompleto(true); diego.setModalidadPreferida("PRESENCIAL");
        diego.setCursos(List.of(mm1010, in1010, in2010)); diego.setHorarios(List.of(h9, h11));
        diego.setNivelBuscado(intermedio);
        estudianteRepo.save(diego);

        Estudiante sofia = new Estudiante();
        sofia.setNombre("Sofía Juárez"); sofia.setEmail("sofia@uvg.edu.gt");
        sofia.setPassword(encoder.encode("pass1234"));
        sofia.setCarrera("Ingeniería en Sistemas"); sofia.setSemestre(6);
        sofia.setOnboardingCompleto(true); sofia.setModalidadPreferida("VIRTUAL");
        sofia.setCursos(List.of(cc2003, cc1011, cc2005)); sofia.setHorarios(List.of(h3, h10));
        sofia.setNivelBuscado(avanzado);
        estudianteRepo.save(sofia);

        Estudiante jorge = new Estudiante();
        jorge.setNombre("Jorge Alvarado"); jorge.setEmail("jorge@uvg.edu.gt");
        jorge.setPassword(encoder.encode("pass1234"));
        jorge.setCarrera("Biotecnología"); jorge.setSemestre(2);
        jorge.setOnboardingCompleto(true); jorge.setModalidadPreferida("AMBAS");
        jorge.setCursos(List.of(fq1010, fg1010)); jorge.setHorarios(List.of(h4, h7));
        jorge.setNivelBuscado(basico);
        estudianteRepo.save(jorge);

        // ── Reviews iniciales ─────────────────────────────────────────────────
        review("ana@uvg.edu.gt",    "lilian@uvg.edu.gt", 5.0,
            "Lilian explica increíblemente bien. Pasé de no entender nada de Big O a poder resolver ejercicios del examen.");
        review("sofia@uvg.edu.gt",  "lilian@uvg.edu.gt", 5.0,
            "Muy buena tutora. Puntual, paciente y domina el tema. Volveré el próximo semestre.");
        review("diego@uvg.edu.gt",  "marco@uvg.edu.gt",  5.0,
            "Marco conecta la física con situaciones reales. Antes memorizaba fórmulas, ahora entiendo de dónde vienen.");
        review("carlos@uvg.edu.gt", "marco@uvg.edu.gt",  4.0,
            "Buen tutor. Conoce el material y es flexible con los horarios. A veces va un poco rápido.");
        review("maria@uvg.edu.gt",  "pedro@uvg.edu.gt",  4.0,
            "Pedro es muy claro. Tiene una forma de presentar los algoritmos que hace que parezcan obvios.");
        review("ana@uvg.edu.gt",    "andrea@uvg.edu.gt", 4.0,
            "Andrea me ayudó a no reprobar Cálculo. Tiene mucha paciencia y no te hace sentir mal por no entender.");

        log.info("Seed completado: 3 niveles, 14 cursos, 15 horarios, 7 tutores, 6 estudiantes, 6 reviews.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void review(String emailEstudiante, String emailTutor, double cal, String texto) {
        neo4jClient.query("""
            MATCH (e:Estudiante {email: $ee}), (t:Tutor {email: $et})
            CREATE (e)-[:DEJO_REVIEW { texto: $tx, calificacion: $cal, fecha: '2026-05-01' }]->(t)
            """)
            .bind(emailEstudiante).to("ee")
            .bind(emailTutor).to("et")
            .bind(texto).to("tx")
            .bind(cal).to("cal")
            .run();
    }

    private Nivel nivel(String nombre, int valor) {
        Nivel n = new Nivel(); n.setNombre(nombre); n.setValor(valor); return n;
    }

    private Curso curso(String codigo, String nombre, String depto) {
        Curso c = new Curso(); c.setCodigo(codigo); c.setNombre(nombre); c.setDepartamento(depto); return c;
    }

    private Horario horario(String dia, String inicio, String fin) {
        Horario h = new Horario(); h.setDia(dia); h.setHoraInicio(inicio); h.setHoraFin(fin); return h;
    }
}
