# specs/001-ranking-recompensas/tasks.md

- [x] **T1. Ruta `/ranking` antes de `/:id` + `obtenerRanking` básico (top 10, orden desc).** RF-01, RF-02
  - Tests: `GET /personajes/ranking` → 200, array plano ≤10, orden recompensa desc.
  - Código: `router.get('/ranking', ...)` **antes** de `/:id`; `exports.obtenerRanking` con agregación `$sort { recompensa: -1 }`, `$limit: 10`, sin validación de limit aún.
  - Hecho cuando: tests de T1 pasan (200, array ≤10, orden desc) y no se rompen tests existentes.

- [x] **T2. Validación estricta de `limit` (1–50, regex).** RF-03, RF-04
  - Tests: `limit=0`, `51`, `abc`, `10.5`, ``, `10&limit=20` → 400 `{ message }`; `limit=5`, `50` → 200 con cantidad exacta.
  - Código: en `obtenerRanking`, validación `typeof limitRaw === 'string' && /^[0-9]+$/.test(limitRaw)` + rango 1–50; 400 con `{ message: "El parámetro limit debe ser un entero entre 1 y 50" }`.
  - Hecho cuando: tests de T2 pasan (400 en inválidos, 200 con cantidad correcta en válidos) y T1 sigue verde.

- [x] **T3. Forma exacta de la respuesta + tripulación (populate).** RF-05
  - Tests: cada entrada tiene **exactamente** `nombre`, `recompensa`, `tripulacion` (string o `null`); sin `_id` ni otros campos.
  - Código: `$lookup` con `Tripulacion.collection.name`, `$project` con `_id:0` y `$cond` para `tripulacion` (nombre o `null`).
  - Hecho cuando: tests de T3 pasan (keys exactas, tripulacion string/null) y T1–T2 siguen verdes.

- [ ] **T4. Desempate por nombre case-insensitive (collation).** RF-06
  - Tests: varios personajes con misma recompensa, nombres "zorro", "Zorro", "Álvaro" → orden asc case-insensitive (strength:2).
  - Código: `Personaje.aggregate(pipeline).collation({ locale: 'es', strength: 2 })`.
  - Hecho cuando: tests de T4 pasan (orden correcto con "zorro"/"Zorro"/"Álvaro") y T1–T3 siguen verdes.

- [ ] **T5. Colección vacía + casos límite extra.** RF-07, casos límite
  - Tests: colección vacía → 200 `[]`; recompensa 0 incluida; `tripulacion: null` sin tripulación; `?foo=bar` ignorado; parámetros extra no rompen.
  - Código: agregación ya maneja vacío (devuelve `[]`); `$cond` ya da `null`; parámetros extra se ignoran por no usarse.
  - Hecho cuando: tests de T5 pasan y T1–T4 siguen verdes.

- [ ] **T6. Suite completa + verificación manual.** RF-01 a RF-07
  - Ejecutar: `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npm test` → 100% pass.
  - Manual: `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npm run dev` → en otra terminal `curl http://localhost:3000/personajes/ranking` → 200, JSON válido, campos esperados.
  - Hecho cuando: suite completa pasa 100% y comprobación manual en `localhost:3000` responde 200 con JSON correcto.