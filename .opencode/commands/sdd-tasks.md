---
description: Generar tasks.md para una spec
agent: plan
---

Use the skill: sdd

Genera `specs/$1/tasks.md` siguiendo la skill sdd.

Reglas:
- Máximo **10 tareas** por spec. Si salen más, **propón dividir la spec**.
- Cada tarea: máximo 20-30 minutos.
- Formato: `- [ ] **Tn. Descripción.** RF-x, RF-y` con línea `  - Hecho cuando: ...`
- Incluir Tests, Código y Hecho cuando.
- Orden lógico (tests primero donde aplique).

$ARGUMENTS
