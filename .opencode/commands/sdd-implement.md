---
description: "Implementar UNA tarea: /sdd-implement 002-nombre T3"
agent: build
---

Use the skill: sdd

Implementa **SOLO** la tarea $2 de `specs/$1/tasks.md`.

Reglas estrictas (skill sdd):
1. **Una sola tarea cada vez**.
2. **Tests primero** (TDD). Deja claro que **fallan** (antes de escribir código). **NO los ejecutes tú**.
3. **Escribe código** hasta que los tests cubran lo que pide la tarea.
4. **NO ejecutes `npm test`, `jest` ni ninguna prueba**. Yo las corro desde **PowerShell** con `$env:MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch"`. **Dame el comando exacto de PowerShell** para correr los tests correspondientes (puede ser el archivo concreto o la suite, según convenga).
5. **Marca la tarea como completada** (`[x]`) en `specs/$1/tasks.md` **ÚNICAMENTE cuando yo confirme** que la suite/tests pasan.
6. **Sin commit**.
7. **PÁRATE** al terminar. No empieces otra tarea.

$ARGUMENTS
