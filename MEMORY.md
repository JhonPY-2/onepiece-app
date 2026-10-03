# MEMORY.md — onepiece-app (backend)

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual

- Backend Node/Express 5 (`:3000`) de un sistema de 3 servicios sobre la misma MongoDB: `onepiece-app` (:3000), `onepiece-frontend` (Next.js, :3001) y `onepiece-estadisticas` (FastAPI, :8000). Solo el backend llama al microservicio.
- `Personaje` y `Tripulante` son colecciones separadas con el mismo shape; `GET /tripulaciones/:id/personajes` las une y agrega `tipo: 'personaje' | 'tripulante'`. Un cambio en una suele requerir el mismo cambio en la otra.
- `GET /tripulaciones/:id/recompensa-total` (GET público) suma con dos agregaciones `$group`/`$sum`, una por colección, y devuelve `{ recompensaTotal }`.
- No hay lint, typecheck, formateador ni config de Jest/ESLint/Prettier. `docker compose up --build` exige los repos hermanos clonados y su Mongo publica 27018, no 27017.

## Decisiones (y por qué)

- `app.js` sin `listen` e `index.js` conectando la DB: así se puede probar con Supertest sin levantar el servidor.
- Se guarda `imagenPublicId` junto a la URL, y cada controller borra el que viene en el body: para borrar la imagen anterior en Cloudinary sin adivinar el id y para que el cliente no pueda falsearlo.
- `ESTADISTICAS_URL` con default `http://127.0.0.1:8000`, timeout de 5 s y cualquier fallo → 502: el backend reenvía la respuesta del microservicio en vez de inventarse datos.
- Se mantiene el contrato de error tal como está (`error` en el middleware JWT, `message` en los controllers): unificarlo rompería el frontend.
- `recompensa-total` devuelve solo `{ recompensaTotal }`, valida el `:id` (400) y da 404 si la tripulación no existe, para que el frontend distinga "no existe" de "total 0". Esa validación no se propagó a `/:id/personajes` a propósito: hacerlo rompería su contrato actual.

## Aprendizajes y errores a evitar

- Los tests leen `MONGODB_URI` de `.env` y corren contra la base de desarrollo, insertando y borrando datos reales: hay que ponerles siempre `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch"` delante.
- Cloudinary y axios se mockean en el path exacto del módulo, nunca en `config/cloudinary`.
- En multipart lo anidado llega como string JSON, así que `utils/normalizarPersonaje.js` es obligatorio en create/update de `Personaje` y `Tripulante`.
- `findByIdAndUpdate` siempre con `runValidators: true`: Mongoose no valida en update por defecto.
- **`aggregate` no castea, `find` sí**: `$match: { tripulacion: req.params.id }` con el id en string no casa con ningún documento y el `$sum` devuelve `[]`, así que el total salía 0 sin error visible. Castea antes con `new mongoose.Types.ObjectId(req.params.id)`, tras validar con `isValidObjectId`.
- Los scripts de migración son ensayo por defecto (necesitan `--aplicar`) y algunos llevan ObjectIds hardcodeados de otra base: no usarlos sin confirmar.
- Sin `.env` el servidor no arranca; sin `JWT_SECRET` fallan los tests de auth.

## Próximos pasos

- `npm run seed` sigue roto: `scripts/seedPersonajes.js` inserta `tripulacion` como string y el schema ahora exige ObjectId. Pendiente, no arreglado.
- Typo `dedfault: null` en `models/Tripulante.js`, por lo que ese campo no tiene default. Pendiente, no arreglado.