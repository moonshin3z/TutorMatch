# TutorMatch UVG

Sistema de recomendación de tutores para la Universidad del Valle de Guatemala.  
Conecta estudiantes con tutores compatibles en curso, nivel y horario usando una base de datos en grafos (Neo4j).

**CC2003 – Algoritmos y Estructuras de Datos · Semestre I 2026**  
Roblero Iván · Moreno Kevin · Hernandez Daniel

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Java        | 21            |
| Maven       | 3.9+          |
| Node.js     | 18+           |
| Docker      | 24+           |

---

## Levantar el proyecto

### 1. Base de datos (Neo4j en Docker)

```bash
docker-compose up -d
```

Espera ~15 segundos. La interfaz web de Neo4j queda disponible en  
`http://localhost:7474` (usuario: `neo4j`, contraseña: `tutormatch123`).

---

### 2. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Al iniciar por primera vez, el seeder puebla automáticamente la base de datos con:
- 3 niveles · 14 cursos · 15 horarios
- 7 tutores con bio, precio y disponibilidad
- 6 estudiantes con preferencias y horarios
- 6 reseñas iniciales

El backend queda en `http://localhost:8081`.

---

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

---

## Credenciales de prueba

| Usuario | Email | Contraseña | Rol |
|---------|-------|-----------|-----|
| Ana Ramírez | ana@uvg.edu.gt | pass1234 | Estudiante |
| Carlos Mendoza | carlos@uvg.edu.gt | pass1234 | Estudiante |
| Lilian Pérez | lilian@uvg.edu.gt | pass1234 | Tutora |
| Roberto Vásquez | roberto@uvg.edu.gt | pass1234 | Tutor |

---

## Resetear la base de datos

Si necesitás volver a los datos iniciales:

```bash
docker-compose down -v   # elimina el volumen de Neo4j
docker-compose up -d     # levanta Neo4j de cero
# reiniciar el backend → el seeder corre automáticamente
```

---

## Estructura del proyecto

```
TutorMatch/
├── docker-compose.yml          # Neo4j 5.20
├── backend/                    # Spring Boot 3.3 · Java 21
│   └── src/main/java/com/tutormatch/
│       ├── domain/             # Entidades Neo4j (@Node)
│       ├── repository/         # Spring Data Neo4j
│       ├── service/            # Lógica de negocio y algoritmo
│       ├── controller/         # REST endpoints
│       ├── security/           # JWT (JJWT 0.11.5)
│       └── config/             # SecurityConfig + DataSeeder
└── frontend/                   # React 18 · Vite · Tailwind CSS
    └── src/
        ├── pages/              # Login, Register, Onboarding,
        │                       # StudentDashboard, TutorDashboard,
        │                       # TutorProfile, TutorSetup
        └── components/         # TutorCard, GuardadoCard,
                                # BottomNav, SearchModal, ...
```

---

## Modelo del grafo

```
(:Estudiante)-[:TOMA]->(:Curso)<-[:ENSENA]-(:Tutor)
(:Estudiante)-[:LIBRE_EN]->(:Horario)<-[:DISPONIBLE_EN]-(:Tutor)
(:Estudiante)-[:BUSCA_NIVEL]->(:Nivel)<-[:TIENE_NIVEL]-(:Tutor)
(:Estudiante)-[:RECOMIENDA {estado, fecha}]->(:Tutor)
(:Estudiante)-[:DEJO_REVIEW {calificacion, texto, fecha}]->(:Tutor)
```

---

## Algoritmo de recomendación

El sistema calcula un **score de compatibilidad** para cada tutor mediante una query Cypher:

| Factor | Puntos |
|--------|--------|
| Curso compartido (×N cursos) | +5 por curso |
| Horario compatible | +3 |
| Nivel tutor > nivel buscado | +3 |
| Nivel tutor = nivel buscado | +1 |
| Rating ≥ 4.5 | +2 |
| Rating ≥ 4.0 | +1 |
| Recomendaciones colaborativas (máx 3) | +1 a +3 |
| Misma carrera | +2 |

Los tutores se ordenan por score descendente. Las razones del match se generan en lenguaje natural ("Enseña CC2003 · disponible lunes · nivel avanzado").

---

## API principal

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register/estudiante` | Registro de estudiante |
| POST | `/api/auth/register/tutor` | Registro de tutor |
| GET  | `/api/recomendaciones/{eId}` | Recomendaciones personalizadas |
| GET  | `/api/recomendaciones/{eId}/guardados` | Tutores guardados con estado |
| PUT  | `/api/recomendaciones/{eId}/completar/{tId}` | Marcar sesión como completada |
| GET  | `/api/tutores?materia=&nivel=&modalidad=&dia=` | Listar tutores con filtros |
| POST | `/api/tutores/{id}/reviews` | Dejar reseña (requiere sesión completada) |
| GET  | `/api/tutores/{id}/stats` | Estadísticas del tutor |
| PUT  | `/api/estudiantes/{id}/busqueda` | Actualizar criterios de búsqueda |
