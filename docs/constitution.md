# Constitución — onepiece-app

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. **Stack simple y sin tooling obligatorio**  
   Node/Express 5 + Mongoose + Jest/Supertest. **No** ESLint, Prettier, TypeScript, ni config de Jest. Si no está en `package.json`, no se usa.

2. **La spec activa manda**  
   Existe en `specs/NNN-nombre/`. **Nada** se implementa si no está ahí. Si falta una decisión, **se para y se pregunta**. AGENTS.md y MEMORY.md son contexto del proyecto, no la spec.

3. **Separación estricta: rutas ↔ controladores ↔ modelos**  
   `routes/x.js` solo monta y delega. `controllers/xController.js` solo lógica de petición/respuesta (`exports.fn = async (req,res)=>{}`). `models/X.js` solo schema Mongoose. Nada de lógica de negocio en rutas ni de HTTP en modelos.

4. **Tests sólo contra `onepiece_agente_scratch`**  
   **Nunca** `npm test` sin `MONGODB_URI=mongodb://127.0.0.1:27017/onepiece_agente_scratch`. Tests de integración usan Mongo real; mocks solo en `subirImagen`/`borrarImagen`/`axios`.

5. **Migraciones seguras y datos protegidos**  
   Migraciones con `--aplicar` se prueban **primero** en `onepiece_agente_scratch`. **Nunca** `deleteMany`/`drop` sobre la base real. `npm run seed` igual: solo contra scratch.

6. **Idioma único: español**  
   Comentarios, errores, logs, commits, issues, PRs y variables descriptivas en español. Sin excepciones.