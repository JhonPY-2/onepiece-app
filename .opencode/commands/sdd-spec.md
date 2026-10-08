---
description: "Crear spec inicial: /sdd-spec 002-nombre idea inicial"
agent: plan
---

Use the skill: sdd

Tarea: crear una nueva spec. Uso esperado: `/sdd-spec 002-nombre "idea inicial"` (el primer argumento es $1: NNN-nombre, el resto es idea/contenido en $ARGUMENTS).

Pasos:
1. Extrae $1 (formato NNN-nombre, p.ej. 002-ranking-recompensas). Si no viene, pide aclaración.
2. Crea la carpeta `specs/$1/` si no existe.
3. Haz preguntas **UNA POR UNA** (máximo 5 preguntas) para aclarar: contexto, usuarios, necesidades, casos límite y fuera de alcance. No generes nada aún.
4. Tras mis respuestas, genera `specs/$1/spec.md` usando ÚNICAMENTE la plantilla de la skill sdd.
5. Escribe requisitos funcionales **en EARS en español** (CUANDO/SI/MIENTRAS/EL SISTEMA). **La spec es QUÉ y POR QUÉ, nada de stack ni nombres de archivos.**
6. Pon "**Estado: borrador**".
7. Incluye: Contexto y objetivo, Usuarios, Historias de usuario, Definiciones, Requisitos funcionales, Requisitos no funcionales, Casos límite, Fuera de alcance, Criterios de finalización, Dudas abiertas con [NECESITA ACLARACIÓN] si aplica.

$ARGUMENTS
