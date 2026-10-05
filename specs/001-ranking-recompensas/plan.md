# specs/001-ranking-recompensas/plan.md

## 1. Archivos a crear/modificar y responsabilidades

| Archivo | Acción | Responsabilidad (Constitución §3) |
|---------|--------|-----------------------------------|
| `controllers/personajeController.js` | **Añadir** `exports.obtenerRanking` | Lógica de petición/respuesta: validar `limit`, ejecutar agregación, poblar `tripulacion`, formatear respuesta, manejar errores con `message`. |
| `routes/personajes.js` | **Añadir** `router.get('/ranking', personajeController.obtenerRanking)` **antes** de `router.get('/:id', ...)` | Solo montar y delegar. Orden crítico: `/ranking` antes de `/:id` para evitar que `:id` capture "ranking". |
| `tests/personajes.routes.test.js` | **Añadir** nuevo `describe` al final | Tests de integración con Supertest contra `onepiece_agente_scratch`. |

**No se tocan**: `models/Personaje.js` (schema no cambia), `app.js`, `middleware/`, `utils/`.

---

## 2. Algoritmo (pseudocódigo) — cubre RF-01 a RF-07

```
FUNCIÓN obtenerRanking(req, res):
    // RF-02, RF-03, RF-04: validación de limit
    limitRaw = req.query.limit
    SI limitRaw NO EXISTE:
        limit = 10
    SINO:
        // Validar estricta: string que cumple /^[0-9]+$/ y 1-50
        SI NO (typeof limitRaw === 'string' Y limitRaw.match(/^[0-9]+$/)):
            DEVOLVER 400 { message: "El parámetro limit debe ser un entero entre 1 y 50" }
        limit = parseInt(limitRaw, 10)
        SI limit < 1 O limit > 50:
            DEVOLVER 400 { message: "El parámetro limit debe ser un entero entre 1 y 50" }

    // RF-01, RF-05, RF-06, RF-07: agregación
    pipeline = [
        { $sort: { recompensa: -1, nombre: 1 } },  // recompensa desc, nombre asc
        { $limit: limit },
        {
            $lookup: {
                from: Tripulacion.collection.name, // usa el modelo, no hardcodea
                localField: "tripulacion",
                foreignField: "_id",
                as: "tripulacionData"
            }
        },
        {
            $project: {
                _id: 0,                            // RF-05: solo 3 campos
                nombre: 1,
                recompensa: 1,
                tripulacion: {                     // nombre o null
                    $cond: [
                        { $gt: [{ $size: "$tripulacionData" }, 0] },
                        { $arrayElemAt: ["$tripulacionData.nombre", 0] },
                        null
                    ]
                }
            }
        }
    ]

    INTENTAR:
        resultados = await Personaje.aggregate(pipeline).collation({ locale: 'es', strength: 2 })
        // RF-06: collation strength:2 ignora mayúsculas/minúsculas (no acentos)
        // RF-07: si colección vacía, resultados = [] → 200 []
        DEVOLVER 200 resultados
    CAPTURAR error:
        DEVOLVER 500 { message: error.message }
```

---

## 3. Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada |
|----------|---------------|------------------------|
| **Validación `limit` con regex `/^[0-9]+$/` + rango 1-50** | Rechaza "10abc", "1e1", "10.5", "-5", "", array (repetido), sin usar `parseInt` que tolera basura. Cumple RF-04 estricto. | `parseInt` + `Number.isInteger`: acepta "10abc" → 10, "1e1" → 10, " 5 " → 5. |
| **Collation en `aggregate().collation({ locale: 'es', strength: 2 })`** | Orden case-insensitive real (ignora mayúsculas/minúsculas, no acentos) en BD, una sola fuente de verdad. `strength: 2` ignora case pero respeta acentos. | `strength: 1` ignora mayúsculas Y acentos (Álvaro = Alvaro), y se descarta porque la spec solo pide ignorar mayúsculas. |
| **`$lookup` con `Tripulacion.collection.name`** | Usa el modelo, no el nombre hardcodeado. Si el modelo cambia, el código sigue funcionando. Cumple AGENTS.md §32. | `"tripulacions"` hardcodeado: frágil, viola principio de usar el modelo. |
| **Agregación con `$lookup` + `$project`** | Resuelve en BD: orden, límite, populate y proyección en una sola consulta. Cumple RF-01, RF-05, RF-06, RF-07 sin traer datos innecesarios (Constitución §1, §5). | Hacer `find().sort().limit()` + `populate()` en JS: traería docs completos, más memoria, dos round-trips. |
| **`$sort: { recompensa: -1, nombre: 1 }` en pipeline** | Orden y desempate en BD, eficiente. La collation en `aggregate()` aplica a todo el pipeline. | Ordenar en JS tras traer datos: pierde eficiencia y no escala. |
| **Validación estricta de `limit` (400 si inválido)** | RF-04 exige 400 con `message`. Validar: no vacío, no array, no decimal, 1-50, entero exacto. `req.query.limit` puede venir como string, array (repetido), o undefined. | Aceptar y truncar/convertir silenciosamente: viola RF-04 y RF-04 criterio "claro". |
| **Respuesta 400 con `{ message: "..." }`** | Contrato de error del proyecto para 400/500: `{ message: ... }` (AGENTS.md §28, confirmado en `personajeController.js` líneas 23, 33, 44, 72, 92). | Usar `{ error: ... }`: solo el middleware JWT lo usa para 401. |
| **Respuesta 404 no aplica** | Endpoint de lista no falla por "no encontrado"; colección vacía → 200 `[]` (RF-07). | Devolver 404 si vacío: contradice RF-07. |
| **`_id: 0` en `$project`** | RF-05: "exactamente 3 campos, sin otros". | Dejar `_id`: violaría "sin otros campos". |
| **Endpoint público (sin `verificarToken`)** | GET son públicos por convención (AGENTS.md §27). RF: "endpoint público". | Protegerlo: rompería HU-01/HU-03 (consumo sin auth). |
| **Tests de integración en serie (--runInBand)** | Permite probar RF-07 (colección vacía) vaciando y restaurando la colección Personaje de forma segura, sin que tests paralelos interfieran. Cambio de script: `npm test` → `jest --runInBand`. | Filtro inexistente (`?recompesa=...`): la spec deja los filtros fuera de alcance y el endpoint no los implementa. |

---

## 4. Estrategia de tests (Jest + Supertest contra `onepiece_agente_scratch`)

**Archivo**: `tests/personajes.routes.test.js` — nuevo `describe('GET /personajes/ranking')` al final.

**Setup/Teardown**: Reutiliza `beforeAll`/`afterAll` del archivo (conexión a `MONGODB_URI`, limpieza). Crear datos de prueba en `beforeEach`/`afterEach` del nuevo describe.

| Test | RF cubierto | Qué verifica |
|------|-------------|--------------|
| `GET /personajes/ranking sin token → 200, array` | RF-01, RF-02 | Público, lista plana, ≤10, orden desc |
| `GET /personajes/ranking?limit=5 → 200, 5 items` | RF-03 | Límite válido respetado |
| `GET /personajes/ranking?limit=50 → 200, ≤50 items` | RF-03 | Límite máximo |
| `GET /personajes/ranking?limit=0 → 400 { message }` | RF-04 | Límite inválido (0) |
| `GET /personajes/ranking?limit=51 → 400 { message }` | RF-04 | Límite >50 |
| `GET /personajes/ranking?limit=abc → 400 { message }` | RF-04 | No numérico |
| `GET /personajes/ranking?limit=10.5 → 400 { message }` | RF-04 | Decimal |
| `GET /personajes/ranking?limit= → 400 { message }` | RF-04 | Vacío |
| `GET /personajes/ranking?limit=10&limit=20 → 400 { message }` | RF-04 | Repetido (array) |
| `GET /personajes/ranking?foo=bar → 200` | Caso límite | Parámetros extra ignorados |
| Orden recompensa desc + nombre asc case-insensitive | RF-01, RF-06 | Varios docs con recompensa igual, nombres "zorro"/"Zorro"/"Álvaro" |
| Empate recompensa → orden por nombre asc case-insensitive | RF-06 | Verifica collation strength:2 |
| Personaje con recompensa 0 incluido | Caso límite | Default schema no filtra |
| Personaje sin tripulación (populate null) → `tripulacion: null` | RF-05 | `$lookup` + `$cond` funciona |
| Colección vacía → 200 `[]` | RF-07 | Sin datos previos |
| Cada entrada tiene **exactamente** `nombre`, `recompensa`, `tripulacion` | RF-05 | `Object.keys()` === 3 |
| Parámetros extra (`?foo=bar`) no rompen | Caso límite | Ignorados silenciosamente |

**Ejecución**:
```bash
MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npx jest tests/personajes.routes.test.js
MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npm test
```