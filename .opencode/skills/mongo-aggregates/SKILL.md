---
name: mongo-aggregates
description: Úsala siempre que escribas, modifiques o revises aggregations, $match, $lookup o consultas a colecciones en este proyecto
---

# Aggregations de Mongo con Mongoose

## Reglas

1. **`aggregate` no castea, `find` sí.** Un `$match: { campo: req.params.id }` con el id en string no casa con el ObjectId guardado y devuelve `[]`. Valida con `mongoose.isValidObjectId(id)` y después castea: `new mongoose.Types.ObjectId(id)`.
2. **Un `$match` que no acierta no falla, devuelve `[]`.** Encima un `$sum` sale `[]` sin error y el total se va a 0 en silencio. No lo tapes con `?? 0`: si el total puede ser 0 de verdad, comprueba antes que el `$match` acierta.
3. **Usa el modelo, no el nombre de la colección.** Mongoose pluraliza `Tripulacion` como `tripulacions`; escribir ese nombre a mano te ata a un detalle de Mongoose. Llama a `Modelo.aggregate(...)`.
4. **`Tripulacion.numeroMiembros` es un campo guardado que queda obsoleto**: crear o borrar miembros no lo recalcula. Si necesitas el conteo, calcúlalo con una agregación, no leas el campo.
5. **Prueba las aggregations con la forma real de los datos.** El id debe ser un ObjectId de verdad y el test debe correr contra Mongo real: un mock no reproduce el fallo de cast, por eso una suite con modelos mockeados puede pasar mientras la de integración falla. Override obligatorio:

   `MONGODB_URI="mongodb://127.0.0.1:27017/onepiece_agente_scratch" npx jest tests/<archivo>.test.js`

## Checklist de revisión

- [ ] Cada `$match` con un `:id` de ruta castea a `new mongoose.Types.ObjectId(...)` tras validar con `isValidObjectId`.
- [ ] Ningún `$sum`/`$group` esconde un `[]` con `?? 0` sin un test que demuestre que el `$match` acierta.
- [ ] Hay un test con total distinto de 0 y otro con resultado vacío (tripulación sin miembros).
- [ ] No aparece ningún nombre de colección escrito a mano.
- [ ] Los conteos de miembros se calculan, no se leen de `numeroMiembros`.
- [ ] Los tests usan ObjectId real contra `onepiece_agente_scratch` y se pasaron con el override, no solo con mocks.

## Al terminar

Indica qué puntos del checklist comprobaste y cómo lo verificaste (comando ejecutado y su resultado). Si un punto no lo comprobaste, dilo en lugar de darlo por bueno.