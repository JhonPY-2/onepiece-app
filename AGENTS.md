# AGENTS.md — onepiece-app (backend)

## Contexto

Backend Node/Express 5 de un sistema de 3 servicios sobre la misma MongoDB: este repo (`onepiece-app`, :3000), `onepiece-frontend` (Next.js, :3001) y `onepiece-estadisticas` (FastAPI, :8000). Solo el backend llama al microservicio.

## Comandos

- `npm run dev` — `nodemon index.js` en :3000. `npm test` — Jest + Supertest (~3 min, usa Mongo real): **ponle siempre el override delante**, o sea `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npm test`.
- Un archivo: `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npx jest tests/tripulantes.routes.test.js`. Un solo test: `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npx jest -t "nombre"`.
- `npm run seed` — solo personajes. Atletas: `node scripts/seedAtletas.js` (no tiene script npm).
- **No hay lint, typecheck, formateador ni config de Jest/ESLint/Prettier.** No los propongas.
- `docker compose up --build` desde aquí exige `../onepiece-estadisticas` y `../onepiece-frontend` clonados; su Mongo publica **27018**, no 27017.

## Tests: la trampa principal

Cada test de integración hace `mongoose.connect(process.env.MONGODB_URI)` leyendo `.env`: **en local corren contra tu base de desarrollo e insertan y borran datos reales**. Para no tocarla:

```
MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npx jest
```

dotenv no sobreescribe variables ya definidas. En CI sí hay base aparte (`onepiece_test`). Cloudinary y axios se mockean en el path exacto del módulo (`jest.mock('../utils/subirImagen')`), nunca en `config/cloudinary`. Los tests de modelos usan `validate()` async, no `validateSync()`.

## Wiring y convenciones

- `app.js` = Express **sin** `listen` (para Supertest); `index.js` = conecta DB + `listen`. Nunca importes `index.js` desde un test. Receta de recurso nuevo: `models/X.js` + `controllers/xController.js` (`exports.fn = async (req,res) => {}`, sin clases) + `routes/x.js`, montado en `app.js`. GET público; POST/PUT/DELETE con `verificarToken`.
- **Contrato de error inconsistente**: el middleware JWT responde 401 con clave `error`, los controllers 400/500 con `message`. No lo unifiques sin tocar también el frontend.
- **Imágenes**: se guarda `imagen` (URL) + `imagenPublicId`, y todo controller hace `delete datos.imagenPublicId` del body para que el cliente no pueda falsear el publicId; al reemplazarla borra la anterior con `utils/borrarImagen.js`, que nunca propaga el fallo de Cloudinary. `Tripulacion` usa `upload.fields` (`imagen`, `fotoCapitan`), no `single`. `middleware/upload.js`: memoryStorage, solo JPEG/PNG/WebP, 5 MB; el error handler de `app.js` traduce 415/413.
- **Multipart**: lo anidado llega como string JSON; `utils/normalizarPersonaje.js` lo pasa a objeto/array (`frutaDiablo`, `habilidades`, `arcos`) y es **obligatorio** en create/update de `Personaje` y `Tripulante` (no en `Atleta`). `findByIdAndUpdate` siempre con `runValidators: true`: Mongoose no valida en update.
- **`Personaje` y `Tripulante` son colecciones separadas con el mismo shape.** `GET /tripulaciones/:id/personajes` las une y agrega `tipo: 'personaje' | 'tripulante'`, así que un cambio en una suele requerir el mismo cambio en la otra. Su campo `tripulacion` es ObjectId `ref: 'Tripulacion'` (requerido) y se `populate` en los GET.
- **Mongoose no castea en `aggregate`**: `$match: { tripulacion: req.params.id }` con el id en string no casa con nada (en `find` sí casaría) y el `$sum` devuelve `[]` sin error, así que un total sale 0 en silencio. Castea antes: `new mongoose.Types.ObjectId(req.params.id)` tras validar con `mongoose.isValidObjectId`.
- Rutas: nombres inconsistentes (`personajes.js`/`atletas.js` vs `tripulaciones_routes.js`/`tripulantes_routes.js`); respeta el nombre existente. `ESTADISTICAS_URL` sale comentado en `.env.example`, default `http://127.0.0.1:8000`, timeout 5 s y fallo → **502** en `controllers/estadisticaController.js`.
- **Validación de `:id` inconsistente en `/tripulaciones/:id/*`**: `recompensa-total` valida con `mongoose.isValidObjectId` (400) y comprueba existencia (404); `personajes` no valida nada y devuelve `200 []` incluso con id basura. Inconsistencia conocida y aceptada, no la "arregles" de paso.

## Bugs conocidos (verificados, no los reintroduzcas)

- **`npm run seed` está roto**: `scripts/seedPersonajes.js` inserta `tripulacion: "Sombrero de Paja"` (string) y el schema ahora exige ObjectId → ValidationError.
- `models/Tripulante.js` escribe `dedfault: null` (typo), así que ese campo no tiene default.
- `scripts/migrarTripulacion.js` y `scripts/corregirTipoTripulacion.js` llevan ObjectIds hardcodeados de la base del autor.
- `scripts/migrarImagenes.js` y `migrarTripulacion.js` son **ensayo por defecto**: necesitan `--aplicar`; el primero lee de `../onepiece-frontend/public` (o `$PUBLIC_DIR`).
- Sin `.env` no arranca (`mongoose.connect(undefined)`); sin `JWT_SECRET` fallan los tests de auth.
- No los arregles a menos que se pida expresamente.

## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Límites

- **Siempre**: respeta el idioma del repo (comentarios, errores, commits en español) y los 4 espacios del archivo que toques; no reformatees código ajeno; prueba lo que cambies; actualizar `MEMORY.md` al terminar cada tarea.
- **Pregunta antes**: de romper el contrato de error (`error` vs `message`), de tocar el microservicio Python o el frontend (repos hermanos), y de cualquier cambio de schema que afecte a la BD.
- **Nunca**: commitees a `master` ni abras PR sin que lo pidan; no toques ni subas `.env`; no corras `npm test` contra la BD de desarrollo sin el override; no ejecutes migraciones sin `--aplicar` y sin confirmar.
- `npm run seed` ejecuta `Personaje.deleteMany({})` y borra todos los personajes: nunca lo corras contra la base onepiece; usa `MONGODB_URI=mongodb://127.0.0.1:27017/onepiece_agente_scratch`.

## Verificación

- Cambio puntual: `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npx jest tests/<archivo>.test.js`, o `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npx jest -t "nombre"` para un solo test.
- Antes de dar por terminado: `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npm test` completo (~3 min; Mongo debe estar arriba).
- Si tocas Cloudinary o el microservicio, confirma que el mock/override sigue en su lugar.
- Endpoints GET nuevos o modificados: además de `npm test`, se pueden comprobar a mano con el MCP de Chrome DevTools abriendo la URL en `http://localhost:3000` con el servidor corriendo (`npm run dev`).
