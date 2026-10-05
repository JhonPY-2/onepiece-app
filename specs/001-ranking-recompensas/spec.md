# specs/001-ranking-recompensas/spec.md

**Estado: implementada**

## Contexto y objetivo
Endpoint público que devuelve el ranking de personajes por recompensa (mayor primero), permitiendo limitar la cantidad de resultados. Sirve para mostrar "los más buscados" sin lógica en el cliente.

## Usuarios
- Frontend: consume el ranking para mostrarlo en página pública.
- Cualquier consumidor HTTP sin autenticación.

## Historias de usuario
- **HU-01**: Como usuario, quiero ver los personajes con mayor recompensa para conocer a los más buscados.
- **HU-02**: Como desarrollador, quiero limitar la cantidad de resultados (1–50) para adaptar la vista.
- **HU-03**: Como consumidor, quiero un error claro si el límite pedido no es válido.

## Requisitos funcionales

| ID | Requisito (EARS) |
|----|------------------|
| RF-01 | CUANDO se consulta el endpoint, EL SISTEMA devuelve una lista plana (array JSON) de personajes ordenada por recompensa descendente. |
| RF-02 | CUANDO no se especifica límite, EL SISTEMA devuelve hasta 10 personajes. |
| RF-03 | CUANDO se envía `limit` entre 1 y 50, EL SISTEMA devuelve como máximo esa cantidad de personajes. |
| RF-04 | SI `limit` no es un número entero entre 1 y 50, ENTONCES EL SISTEMA responde 400 con `{ message: "..." }`. |
| RF-05 | CUANDO la respuesta es exitosa, EL SISTEMA incluye en cada entrada exactamente: `nombre`, `recompensa` y `tripulacion` (nombre de la tripulación o `null` si no tiene), sin otros campos. |
| RF-06 | CUANDO hay empate en recompensa, EL SISTEMA ordena por nombre ascendente sin distinguir mayúsculas de minúsculas. |
| RF-07 | CUANDO no existe ningún personaje registrado, EL SISTEMA devuelve lista vacía. |

## Requisitos no funcionales
- **Rendimiento**: la consulta se resuelve en la base de datos, sin traer datos innecesarios.
- **Seguridad**: endpoint público; validación estricta del parámetro `limit`.
- **Consistencia**: usa el mismo contrato de error (`message`) que el resto de controladores.

## Casos límite
- `limit` no numérico, ≤ 0, o > 50 → 400.
- `limit` ausente → 10.
- `limit` vacío (`?limit=`), decimal (`10.5`) o repetido (`limit=10&limit=20`) → 400.
- Parámetros desconocidos se ignoran.
- Personajes con recompensa 0 se incluyen.
- Personajes con recompensa igual → orden por nombre ascendente sin distinguir mayúsculas de minúsculas.
- Personaje sin tripulación válida → `tripulacion: null` en la respuesta.
- Colección vacía → 200 con `[]`.

## Fuera de alcance
- Ranking de `Tripulante` (solo `Personaje`).
- Paginación (`skip`/`page`); solo `limit`.
- Filtros por tripulación, arco, fruta, etc.
- Caché, ETag, headers de paginación.

## Criterios de finalización
- Endpoint creado y accesible en `/personajes/ranking`.
- Todos los RF cubiertos por tests de integración contra la base de pruebas.

## Dudas abiertas
**Ninguna.**