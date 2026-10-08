---
description: "Añadir/cambiar requisito en spec: /sdd-change 002-nombre 'nuevo RF...'"
agent: plan
---

Use the skill: sdd

Añade o modifica un requisito para `specs/$1/`. **No toques código**.

$ARGUMENTS

Pasos:
1. Lee `specs/$1/spec.md`, `plan.md` y `tasks.md` para entender el estado actual.
2. Aplica el cambio SOLO en la documentación siguiendo el flujo: **spec primero → indicar qué cambiaría en plan.md → indicar qué cambiaría en tasks.md → código al final**.
3. Actualiza `spec.md`: RF en **EARS en español**, actualiza casos límite, fuera de alcance si procede, y criterios de finalización si cambia.
4. Muestra el **diff de spec.md**.
5. Indica claramente qué cambios serían necesarios en `plan.md` y `tasks.md` (lista). **No los modifiques aún**.
6. Espera mi aprobación explícita antes de aplicar cambios a plan/tasks.

$ARGUMENTS
