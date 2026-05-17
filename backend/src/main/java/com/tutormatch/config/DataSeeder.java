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
        // Si ya hay tutores con bio, el seed está actualizado
        if (tutorRepo.count() > 0) {
            boolean actualizado = tutorRepo.findAll().stream()
                    .anyMatch(t -> t.getBio() != null && !t.getBio().isEmpty());
            if (actualizado) {
                log.info("Seed actualizado encontrado. Saltando.");
                return;
            }
            // Datos del seed anterior sin campos nuevos — limpiar y re-seed
            log.info("Seed desactualizado detectado. Limpiando base de datos...");
            neo4jClient.query("MATCH (n) DETACH DELETE n").run();
        }

        log.info("Poblando base de datos con datos enriquecidos...");

        // ── Niveles ──────────────────────────────────────────────────────────
        Nivel basico     = nivel("Básico", 1);
        Nivel intermedio = nivel("Intermedio", 2);
        Nivel avanzado   = nivel("Avanzado", 3);
        basico     = nivelRepo.save(basico);
        intermedio = nivelRepo.save(intermedio);
        avanzado   = nivelRepo.save(avanzado);

        // ── Cursos ───────────────────────────────────────────────────────────
        Curso cc2003 = curso("CC2003", "Algoritmos y Estructuras de Datos", "Ciencias de la Computación");
        Curso mm1010 = curso("MM1010", "Cálculo Diferencial",              "Matemática");
        Curso mm2040 = curso("MM2040", "Álgebra Lineal",                   "Matemática");
        Curso fg1010 = curso("FG1010", "Física General",                   "Física");
        Curso cc1011 = curso("CC1011", "Programación Orientada a Objetos", "Ciencias de la Computación");
        Curso in1010 = curso("IN1010", "Fundamentos de Ingeniería",        "Ingeniería");
        cursoRepo.saveAll(List.of(cc2003, mm1010, mm2040, fg1010, cc1011, in1010));

        // ── Horarios ─────────────────────────────────────────────────────────
        Horario h1  = horario("Lunes",     "16:00", "18:00");
        Horario h2  = horario("Lunes",     "10:00", "12:00");
        Horario h3  = horario("Martes",    "14:00", "16:00");
        Horario h4  = horario("Miércoles", "14:00", "16:00");
        Horario h5  = horario("Miércoles", "08:00", "10:00");
        Horario h6  = horario("Jueves",    "10:00", "12:00");
        Horario h7  = horario("Jueves",    "16:00", "18:00");
        Horario h8  = horario("Viernes",   "09:00", "11:00");
        Horario h9  = horario("Viernes",   "14:00", "16:00");
        Horario h10 = horario("Sábado",    "10:00", "12:00");
        List<Horario> hs = horarioRepo.saveAll(List.of(h1,h2,h3,h4,h5,h6,h7,h8,h9,h10));
        h1=hs.get(0); h2=hs.get(1); h3=hs.get(2); h4=hs.get(3); h5=hs.get(4);
        h6=hs.get(5); h7=hs.get(6); h8=hs.get(7); h9=hs.get(8); h10=hs.get(9);

        // ── Tutores ──────────────────────────────────────────────────────────
        Tutor lilian = new Tutor();
        lilian.setNombre("Lilian Pérez");
        lilian.setEmail("lilian@uvg.edu.gt");
        lilian.setPassword(encoder.encode("pass1234"));
        lilian.setRating(4.8); lilian.setExperiencia(5);
        lilian.setBio("Ingeniera en Sistemas, 5to año. Especialista en algoritmos y estructuras. " +
                "Explico paso a paso, sin saltar pasos. Mis estudiantes suben de nota en el primer examen.");
        lilian.setPrecio(80.0); lilian.setModalidad("AMBAS");
        lilian.setCursos(List.of(cc2003, cc1011));
        lilian.setHorarios(List.of(h1, h4));
        lilian.setNivel(avanzado); lilian.setTotalReviews(3);
        tutorRepo.save(lilian);

        Tutor pedro = new Tutor();
        pedro.setNombre("Pedro García");
        pedro.setEmail("pedro@uvg.edu.gt");
        pedro.setPassword(encoder.encode("pass1234"));
        pedro.setRating(4.5); pedro.setExperiencia(3);
        pedro.setBio("Ing. en Sistemas, 4to año. Cálculo y Algoritmos son mis fuertes. " +
                "Metodología visual: resuelvo problemas en pizarrón compartido para que el concepto quede claro.");
        pedro.setPrecio(65.0); pedro.setModalidad("VIRTUAL");
        pedro.setCursos(List.of(cc2003, mm1010));
        pedro.setHorarios(List.of(h4, h6));
        pedro.setNivel(intermedio); pedro.setTotalReviews(2);
        tutorRepo.save(pedro);

        Tutor andrea = new Tutor();
        andrea.setNombre("Andrea López");
        andrea.setEmail("andrea@uvg.edu.gt");
        andrea.setPassword(encoder.encode("pass1234"));
        andrea.setRating(4.2); andrea.setExperiencia(2);
        andrea.setBio("Matemática aplicada, 3er año. Cálculo y Álgebra Lineal sin drama. " +
                "Creo que cualquiera puede aprender matemática si se le explica con el contexto correcto.");
        andrea.setPrecio(55.0); andrea.setModalidad("PRESENCIAL");
        andrea.setCursos(List.of(mm1010, mm2040));
        andrea.setHorarios(List.of(h1, h3));
        andrea.setNivel(intermedio); andrea.setTotalReviews(1);
        tutorRepo.save(andrea);

        Tutor marco = new Tutor();
        marco.setNombre("Marco Castillo");
        marco.setEmail("marco@uvg.edu.gt");
        marco.setPassword(encoder.encode("pass1234"));
        marco.setRating(4.6); marco.setExperiencia(4);
        marco.setBio("Ingeniería Civil, 5to año. Física y fundamentos de ingeniería desde la intuición física, " +
                "no solo las fórmulas. Ex-ayudante de cátedra en FG1010.");
        marco.setPrecio(70.0); marco.setModalidad("AMBAS");
        marco.setCursos(List.of(fg1010, in1010));
        marco.setHorarios(List.of(h2, h7, h10));
        marco.setNivel(avanzado); marco.setTotalReviews(2);
        tutorRepo.save(marco);

        // ── Estudiantes ──────────────────────────────────────────────────────
        Estudiante ana = new Estudiante();
        ana.setNombre("Ana Ramírez"); ana.setEmail("ana@uvg.edu.gt");
        ana.setPassword(encoder.encode("pass1234"));
        ana.setCarrera("Ingeniería en Sistemas"); ana.setSemestre(4);
        ana.setOnboardingCompleto(true); ana.setModalidadPreferida("AMBAS");
        ana.setCursos(List.of(cc2003)); ana.setHorarios(List.of(h1, h4));
        ana.setNivelBuscado(basico);
        estudianteRepo.save(ana);

        Estudiante carlos = new Estudiante();
        carlos.setNombre("Carlos Mendoza"); carlos.setEmail("carlos@uvg.edu.gt");
        carlos.setPassword(encoder.encode("pass1234"));
        carlos.setCarrera("Ingeniería Civil"); carlos.setSemestre(2);
        carlos.setOnboardingCompleto(true); carlos.setModalidadPreferida("PRESENCIAL");
        carlos.setCursos(List.of(mm1010, fg1010)); carlos.setHorarios(List.of(h2, h6));
        carlos.setNivelBuscado(basico);
        estudianteRepo.save(carlos);

        Estudiante maria = new Estudiante();
        maria.setNombre("María Ortiz"); maria.setEmail("maria@uvg.edu.gt");
        maria.setPassword(encoder.encode("pass1234"));
        maria.setCarrera("Ingeniería en Sistemas"); maria.setSemestre(5);
        maria.setOnboardingCompleto(true); maria.setModalidadPreferida("VIRTUAL");
        maria.setCursos(List.of(cc1011, mm2040)); maria.setHorarios(List.of(h3, h9));
        maria.setNivelBuscado(intermedio);
        estudianteRepo.save(maria);

        Estudiante diego = new Estudiante();
        diego.setNombre("Diego Torres"); diego.setEmail("diego@uvg.edu.gt");
        diego.setPassword(encoder.encode("pass1234"));
        diego.setCarrera("Ingeniería Mecánica"); diego.setSemestre(3);
        diego.setOnboardingCompleto(true); diego.setModalidadPreferida("PRESENCIAL");
        diego.setCursos(List.of(mm1010, in1010)); diego.setHorarios(List.of(h6, h8));
        diego.setNivelBuscado(intermedio);
        estudianteRepo.save(diego);

        Estudiante sofia = new Estudiante();
        sofia.setNombre("Sofía Juárez"); sofia.setEmail("sofia@uvg.edu.gt");
        sofia.setPassword(encoder.encode("pass1234"));
        sofia.setCarrera("Ingeniería en Sistemas"); sofia.setSemestre(6);
        sofia.setOnboardingCompleto(true); sofia.setModalidadPreferida("VIRTUAL");
        sofia.setCursos(List.of(cc2003, cc1011)); sofia.setHorarios(List.of(h1, h7));
        sofia.setNivelBuscado(avanzado);
        estudianteRepo.save(sofia);

        // ── Reviews iniciales ─────────────────────────────────────────────────
        // Las insertamos directamente con Cypher para asociarlas a los nodos creados
        neo4jClient.query("""
            MATCH (e:Estudiante {email: 'ana@uvg.edu.gt'}),
                  (t:Tutor {email: 'lilian@uvg.edu.gt'})
            CREATE (e)-[:DEJO_REVIEW {
                texto: 'Lilian explica increíblemente bien. Pasé de no entender nada de Big O a poder resolver los ejercicios del examen. La recomiendo al 100%.',
                calificacion: 5.0,
                fecha: '2026-04-10'
            }]->(t)
            """).run();

        neo4jClient.query("""
            MATCH (e:Estudiante {email: 'sofia@uvg.edu.gt'}),
                  (t:Tutor {email: 'lilian@uvg.edu.gt'})
            CREATE (e)-[:DEJO_REVIEW {
                texto: 'Muy buena tutora. Puntual, paciente y domina el tema. Volveré el próximo semestre.',
                calificacion: 5.0,
                fecha: '2026-04-22'
            }]->(t)
            """).run();

        neo4jClient.query("""
            MATCH (e:Estudiante {email: 'diego@uvg.edu.gt'}),
                  (t:Tutor {email: 'marco@uvg.edu.gt'})
            CREATE (e)-[:DEJO_REVIEW {
                texto: 'Marco conecta la física con situaciones reales, eso hace que todo tenga sentido. Antes memorizaba fórmulas, ahora entiendo de dónde vienen.',
                calificacion: 5.0,
                fecha: '2026-05-01'
            }]->(t)
            """).run();

        neo4jClient.query("""
            MATCH (e:Estudiante {email: 'carlos@uvg.edu.gt'}),
                  (t:Tutor {email: 'marco@uvg.edu.gt'})
            CREATE (e)-[:DEJO_REVIEW {
                texto: 'Buen tutor. Conoce el material y es flexible con los horarios. A veces va un poco rápido.',
                calificacion: 4.0,
                fecha: '2026-05-10'
            }]->(t)
            """).run();

        neo4jClient.query("""
            MATCH (e:Estudiante {email: 'maria@uvg.edu.gt'}),
                  (t:Tutor {email: 'pedro@uvg.edu.gt'})
            CREATE (e)-[:DEJO_REVIEW {
                texto: 'Pedro es muy claro explicando. Tiene una forma de presentar los algoritmos que hace que parezcan obvios. Recomendado.',
                calificacion: 4.0,
                fecha: '2026-05-12'
            }]->(t)
            """).run();

        neo4jClient.query("""
            MATCH (e:Estudiante {email: 'ana@uvg.edu.gt'}),
                  (t:Tutor {email: 'andrea@uvg.edu.gt'})
            CREATE (e)-[:DEJO_REVIEW {
                texto: 'Andrea me ayudó a no reprobar Cálculo. Tiene mucha paciencia y no te hace sentir mal por no entender.',
                calificacion: 4.0,
                fecha: '2026-04-30'
            }]->(t)
            """).run();

        log.info("Seed completado: 3 niveles, 6 cursos, 10 horarios, 4 tutores, 5 estudiantes, 6 reviews.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Nivel nivel(String nombre, int valor) {
        Nivel n = new Nivel();
        n.setNombre(nombre); n.setValor(valor);
        return n;
    }

    private Curso curso(String codigo, String nombre, String depto) {
        Curso c = new Curso();
        c.setCodigo(codigo); c.setNombre(nombre); c.setDepartamento(depto);
        return c;
    }

    private Horario horario(String dia, String inicio, String fin) {
        Horario h = new Horario();
        h.setDia(dia); h.setHoraInicio(inicio); h.setHoraFin(fin);
        return h;
    }
}
