---
description: Generar plan.md para una spec
agent: plan
---

Use the skill: sdd

Genera `specs/$1/plan.md` siguiendo exactamente la plantilla/estructura de la skill sdd.

Requisitos previos:
- `specs/$1/spec.md` debe existir.
- Si la spec no está **aprobada** o tiene alguna entrada con `[NECESITA ACLARACIÓN]`, **PARA y avisa**. No generes plan.

Contenido obligatorio según skill:
1. Archivos a crear/modificar y responsabilidades (Constitución §3: rutas↔controladores↔modelos)
2. Lógica (algoritmo/pseudocódigo) que cubra todos los RF
3. Decisiones técnicas justificadas (tabla: Decisión, Justificación, Alternativa descartada)
4. Estrategia de tests (Jest + Supertest contra MongoDB; SIEMPRE `MONGODB_URI=mongodb://127.0.0.1:27017/onepiece_agente_scratch`; candado existe y el agente NO ejecuta tests, yo los corro desde PowerShell)
5. Mapeo RF → implementación/tests

$ARGUMENTS
