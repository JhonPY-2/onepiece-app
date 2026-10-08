---
description: Ver estado de una spec (fase, tareas, siguiente paso)
agent: plan
---

Use the skill: sdd

Lee `specs/$1/` (spec.md, plan.md, tasks.md) y `MEMORY.md`.

Responde **en pocas líneas**:
- Carpeta: specs/$1
- Fase actual (borrador/aprobada/implementada según spec.md)
- Estado de tareas: hechas x / y
- Siguiente comando `/sdd-*` exacto recomendado
- Notas breves (dudas abiertas si las hay)

**No modifiques ningún archivo**.

$ARGUMENTS
