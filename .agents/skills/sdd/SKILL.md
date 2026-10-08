---
name: sdd
description: "Úsala siempre que trabajes con Spec-Driven Development en este proyecto (docs/constitution.md o cualquier archivo dentro de specs/): redactar, revisar o cambiar specs, planes y tareas, o implementar y validar tareas de una spec."
---

# Skill: Spec-Driven Development (SDD) para onepiece-app

Esta skill define el flujo obligatorio para trabajar con especificaciones en este repositorio, siguiendo los principios de `docs/constitution.md`.

## 1. Flujo obligatorio

El flujo debe respetarse estrictamente en este orden:

1. **Constitución** → Leer `docs/constitution.md` antes de empezar cualquier trabajo con specs.
2. **Spec** → Crear/revisar `specs/NNN-nombre/spec.md`. **La spec manda**.
3. **Clarificación** → Resolver dudas abiertas en la spec. **Nunca pasar a la siguiente fase sin aprobación explícita**.
4. **Plan** → Crear `specs/NNN-nombre/plan.md`.
5. **Tareas** → Crear `specs/NNN-nombre/tasks.md`.
6. **Implementación** → Implementar **una sola tarea cada vez** (tests primero → código → marcar tarea → parar).
7. **Validación** → Verificar que se cumplen todos los criterios de finalización de la spec.
8. **Cambio** → Un cambio de requisitos **siempre se hace primero en la spec**, luego en plan, luego en tareas, y **por último en el código**.

Reglas del flujo:
- Cada spec vive en `specs/NNN-nombre/` con **exactamente**: `spec.md`, `plan.md` y `tasks.md`.
- **Nunca pasar a la siguiente fase sin aprobación explícita**.
- La spec es el **QUÉ y el PORQUÉ**; no debe contener detalles de stack, nombres de archivos, frameworks o implementación.
- Al terminar cada fase, **actualizar `MEMORY.md`** (resumir estado, decisiones importantes con su porqué, errores a evitar). Mantenerlo breve.
- Si algo se convierte en regla permanente, proponer moverlo a `AGENTS.md` en lugar de dejarlo en `MEMORY.md`.

## 2. Plantilla de spec (`spec.md`)

Todo `spec.md` debe seguir esta estructura:

```markdown
# specs/NNN-nombre/spec.md

**Estado: borrador | aprobada | implementada**

## Contexto y objetivo
(Explicar el problema, el contexto del proyecto y el objetivo a alcanzar. QUÉ y PORQUÉ, no CÓMO)

## Usuarios
(Definir usuarios/actores afectados)

## Historias de usuario
- Como [usuario], quiero [acción], para [beneficio].

## Definiciones
(Términos relevantes para evitar ambigüedad)

## Requisitos funcionales (RF)
| ID | Requisito (en EARS) |
|---|--------------------|

## Requisitos no funcionales (RNF)
| ID | Requisito |
|---|-----------|

## Casos límite
(Listar casos límite relevantes)

## Fuera de alcance
(Qué NO se incluye en esta spec)

## Criterios de finalización
(Listar criterios verificables para considerar la spec completada/implementada)

## Dudas abiertas
- [NECESITA ACLARACIÓN] ...
```

Notas sobre la spec:
- **Estado** obligatorio: `borrador`, `aprobada` o `implementada`.
- Requisitos funcionales deben escribirse **obligatoriamente en formato EARS** (ver sección 3).
- Sin palabras vagas ("adecuado", "correcto", "rápido", etc.). Todo debe ser verificable.
- Específica para backend cuando aplique (este proyecto es backend Node/Express/Mongoose).

## 3. Requisitos en EARS (en español)

Todos los RF deben redactarse siguiendo el formato **EARS** (Easy Approach to Requirements Syntax), en español:

- **CUANDO** [evento/condición], **EL SISTEMA** [comportamiento/resultados]
- **SI** [condición], **ENTONCES** [respuesta/comportamiento]
- **MIENTRAS** [estado], **EL SISTEMA** [comportamiento]
- **EL SISTEMA SIEMPRE** [invariante/regla]

Requisitos en EARS deben ser **verificables**, inequívocos y sin ambigüedad. No usar lenguaje subjetivo.

## 4. Plan (`plan.md`)

Todo `plan.md` debe contener al menos:

1. **Archivos a crear/modificar y responsabilidades** (siguiendo Constitución §3: rutas ↔ controladores ↔ modelos). Explicar qué responsabilidad tiene cada archivo.
2. **Lógica (algoritmo/pseudocódigo)** que cubra todos los RF.
3. **Decisiones técnicas justificadas**: tabla con columnas `Decisión`, `Justificación`, `Alternativa descartada`.
4. **Estrategia de tests**: especificar tests con Jest + Supertest contra MongoDB, indicar qué RF cubre cada test. Recordar: **SIEMPRE** con `MONGODB_URI` de `onepiece_agente_scratch`. Hay un candado que aborta si no es exactamente esa base.
5. **Mapeo RF → implementación/tests**: dejar claro qué parte cubre cada RF.

Notas sobre tests en este proyecto:
- Tests son **Jest + Supertest** contra **MongoDB real** (no mocks de BD).
- **Obligatorio**: usar `MONGODB_URI=mongodb://127.0.0.1:27017/onepiece_agente_scratch`.
- Existe un **candado global** que aborta los tests si el nombre de la base no es **exactamente** `onepiece_agente_scratch` (validación estricta, sin substring). **El agente NO ejecuta tests ni toca la base real**; yo los corro desde PowerShell y el agente me proporciona el comando exacto.
- Respetar `docs/constitution.md` (tests solo contra scratch, mocks solo donde corresponde: `subirImagen`/`borrarImagen`/`axios`).

## 5. Tareas (`tasks.md`)

Formato obligatorio para cada tarea:

```markdown
- [ ] **Tn. Descripción breve y accionable.** RF-x, RF-y
  - Tests: (qué tests crear/ajustar, qué debe pasar en rojo/verde)
  - Código: (qué cambiar en qué archivos, siguiendo convenciones)
  - Hecho cuando: (criterio de completitud verificable)
```

Reglas para tareas:
- Máximo **10 tareas** por spec.
- Cada tarea debe tomar **máximo 20-30 minutos**.
- Incluir **RF cubiertos** explícitamente.
- Criterio "Hecho cuando:" debe ser **concreto y verificable** (no ambiguo).
- Las tareas deben seguir orden lógico (tests primero donde aplique).

## 6. Implementación (regla crítica)

**Una sola tarea cada vez**. Para cada tarea:

1. **Escribir tests primero** (TDD). Dejar claro que **fallan** (antes de escribir código). **No ejecutarlos tú** (yo los corro desde PowerShell).
2. **Escribir código** hasta que los tests cubran lo que pide la tarea.
3. **Verificar lógica** contra lo especificado (sin sobreimplementar). No modificar código ajeno innecesariamente.
4. **Marcar la tarea como completada** (`[x]`) **SOLO cuando yo confirme** que la suite/los tests pasan.
5. **Parar** después de cada tarea. No pasar a la siguiente tarea sin confirmación.

Reglas de ejecución (operativas):
- **El agente NO ejecuta `npm test`, `jest` ni ninguna prueba** contra la base. Yo ejecuto la suite desde **PowerShell** con `MONGODB_URI` de `onepiece_agente_scratch`.
- **El agente SIEMPRE me da el comando exacto** para correr los tests correspondientes (suite completa o archivo/test concreto), usando `$env:MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch"`.
- **Nunca** conectar a la base real `onepiece`.
- Respetar estrictamente `docs/constitution.md` en todo momento.

## 7. Validación y cambios

- **Validación**: comprobar que todos los criterios de finalización de la spec se cumplen antes de darla por `implementada`.
- **Cambios**: cualquier cambio de requisitos → spec primero → plan → tareas → código (último). Mantener trazabilidad RF ↔ tests ↔ código.
- Al cambiar cualquier fase, actualizar `spec.md/plan.md/tasks.md` coherentemente y reflejarlo en `MEMORY.md`.