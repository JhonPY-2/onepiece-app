---
description: Revisar spec en busca de ambigüedades, contradicciones o huecos
agent: plan
---

Use the skill: sdd

Revisa `specs/$1/spec.md` como QA crítico. Objetivo: **solo detectar, NO proponer soluciones**.

Detecta:
- Ambigüedades
- Contradicciones entre RF
- Casos límite no cubiertos
- Conflictos con `docs/constitution.md`
- Requisitos no verificables o con palabras vagas
- Falta de criterios de finalización

Presenta lista numerada de hallazgos. Si no hay hallazgos, di "No se detectan ambigüedades ni contradicciones. La spec parece clara para pasar a Plan."

$ARGUMENTS
