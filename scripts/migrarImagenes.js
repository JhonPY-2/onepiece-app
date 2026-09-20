// scripts/migrarImagenes.js
//
// Sube a Cloudinary las imagenes que hoy viven en onepiece-frontend/public
// y guarda la URL y el publicId en Mongo para los registros que aun no los tienen.
// Si un registro ya tiene una URL de Cloudinary pero no publicId, solo recupera el publicId
// desde la URL (no vuelve a subir la imagen).
//
//   node scripts/migrarImagenes.js            -> ENSAYO: solo muestra que haria (no cambia nada)
//   node scripts/migrarImagenes.js --aplicar  -> sube a Cloudinary y actualiza la BD
//
// Se puede ejecutar varias veces: solo procesa registros con imagenPublicId vacio.
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const conectarDB = require('../config/db');
const subirImagen = require('../utils/subirImagen');
const Personaje = require('../models/Personaje');
const Atleta = require('../models/Atleta');

const APLICAR = process.argv.includes('--aplicar');

// Carpeta con las imagenes actuales (se puede cambiar con la variable PUBLIC_DIR)
const CARPETA_PUBLIC =
  process.env.PUBLIC_DIR ||
  path.resolve(__dirname, '..', '..', 'onepiece-frontend', 'public');

// Archivos de public que no son fotos de personajes/atletas
const IGNORAR = ['logo'];

// Si algun nombre de la BD no se empareja solo con su archivo, agregalo aqui:
//   'Nombre exacto en la BD': 'archivo.png'
const MANUAL = {
  // 'Jinbe': 'jimbre.png',
};

const esURL = (texto) => /^https?:\/\//i.test(String(texto || ''));

// Saca el publicId de una URL de Cloudinary:
// .../upload/v1789855538/onepiece-app/abc123.jpg  ->  "onepiece-app/abc123"
function extraerPublicId(url) {
  if (!/res\.cloudinary\.com/i.test(String(url))) return null;
  const coincidencia = String(url).match(
    /\/upload\/(?:v\d+\/)?(.+?)\.[a-z0-9]+(?:\?.*)?$/i
  );
  return coincidencia ? coincidencia[1] : null;
}

// "Lionel Messi" -> "lionelmessi" (sin tildes, espacios ni simbolos)
const normalizar = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

let archivos = [];

function buscarArchivo(doc) {
  const porNombre = (n) =>
    archivos.find((a) => a.nombre.toLowerCase() === String(n).toLowerCase());

  // 1) Asignacion manual
  if (MANUAL[doc.nombre]) return porNombre(MANUAL[doc.nombre]);

  // 2) Si la BD ya guarda un nombre de archivo (ej. "messi.png"), usarlo
  if (doc.imagen && !esURL(doc.imagen)) {
    const exacto = porNombre(path.basename(doc.imagen));
    if (exacto) return exacto;
  }

  // 3) Emparejar por nombre: "Monkey D. Luffy" contiene "luffy" -> luffy.png
  const nombreNorm = normalizar(doc.nombre);
  const candidatos = archivos
    .filter((a) => a.base.length >= 3 && nombreNorm.includes(a.base))
    .sort((a, b) => b.base.length - a.base.length);

  return candidatos[0];
}

async function migrar(Modelo, etiqueta) {
  const docs = await Modelo.find({ imagenPublicId: null });
  const resumen = {
    subidas: 0,
    publicIdRecuperado: 0,
    sinArchivo: 0,
    yaEnNube: 0,
    errores: 0,
  };

  console.log(`\n=== ${etiqueta}: ${docs.length} registro(s) sin imagenPublicId ===`);

  for (const doc of docs) {
    if (esURL(doc.imagen)) {
      // Ya esta en Cloudinary: no se vuelve a subir, solo se recupera su publicId
      const publicId = extraerPublicId(doc.imagen);

      if (!publicId) {
        resumen.yaEnNube++;
        console.log(`- ${doc.nombre}: URL que no es de Cloudinary, se omite`);
        continue;
      }

      if (!APLICAR) {
        console.log(`- ${doc.nombre}: publicId ${publicId}  (ensayo)`);
        continue;
      }

      try {
        await Modelo.updateOne({ _id: doc._id }, { $set: { imagenPublicId: publicId } });
        resumen.publicIdRecuperado++;
        console.log(`- ${doc.nombre}: publicId guardado (${publicId})`);
      } catch (error) {
        resumen.errores++;
        console.error(`- ${doc.nombre}: ERROR ${error.message}`);
      }
      continue;
    }

    const archivo = buscarArchivo(doc);
    if (!archivo) {
      resumen.sinArchivo++;
      console.log(`- ${doc.nombre}: SIN ARCHIVO (agregalo en MANUAL)`);
      continue;
    }

    if (!APLICAR) {
      console.log(`- ${doc.nombre} -> ${archivo.nombre}  (ensayo)`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(path.join(CARPETA_PUBLIC, archivo.nombre));
      const { url, publicId } = await subirImagen(buffer);
      await Modelo.updateOne(
        { _id: doc._id },
        { $set: { imagen: url, imagenPublicId: publicId } }
      );
      resumen.subidas++;
      console.log(`- ${doc.nombre} -> ${archivo.nombre}  subida OK`);
    } catch (error) {
      resumen.errores++;
      console.error(`- ${doc.nombre}: ERROR ${error.message}`);
    }
  }

  console.log('Resumen:', resumen);
}

async function main() {
  console.log(
    APLICAR
      ? 'MODO APLICAR: se subira a Cloudinary y se actualizara la BD'
      : 'MODO ENSAYO: no se cambia nada (usa --aplicar para ejecutar)'
  );
  console.log('Carpeta de imagenes:', CARPETA_PUBLIC);

  archivos = fs
    .readdirSync(CARPETA_PUBLIC)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .map((f) => ({
      nombre: f,
      // "sanji2.png" -> "sanji"; "Usopp.png" -> "usopp"
      base: normalizar(path.parse(f).name).replace(/\d+$/, ''),
    }))
    .filter((f) => !IGNORAR.includes(f.base));

  console.log(`Imagenes encontradas: ${archivos.length}`);

  await conectarDB();
  await migrar(Personaje, 'Personajes');
  await migrar(Atleta, 'Atletas');
}

main()
  .catch((error) => {
    console.error('Error en la migracion:', error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.connection.close());