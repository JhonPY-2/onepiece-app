---
description: Validar spec requisito por requisito (sin modificar nada)
agent: plan
---

Use the skill: sdd

Recorre `specs/$1/spec.md` **requisito por requisito** (RF-01, RF-02, ...).

Para cada RF:
1. Indica qué test(s) lo cubren (archivo y nombre exacto del test).
2. Indica si el criterio queda **realmente verificado** por ese test, o si el test es **débil** (ejemplos: usa `<=` cuando pide número exacto, verifica solo estructura genérica, no cubre caso límite, etc.).
3. Si algún RF **no está cubierto** o el test es débil, dilo **claramente**. **NO arregles nada**.

Al final:
- Comprueba los **criterios de finalización** de la spec.
- Da un **veredicto** claro: ¿la spec está cumplida? (Sí/No + justificación breve).

Notas: NO ejecutes tests. Solo lectura (spec, plan, tasks y tests existentes). Proyecto backend; omite referencias a interfaz/DevTools.

$ARGUMENTS
