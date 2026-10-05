function extraerNombreBaseDeDatos(uri) {
  // Extrae el nombre exacto de la base de datos desde una URI de MongoDB
  // Formatos válidos: mongodb://host:port/dbName, mongodb://user:pass@host:port/dbName?query
  
  if (typeof uri !== 'string') {
    throw new Error('La URI de MongoDB debe ser una cadena de texto');
  }
  
  const uriTrimmed = uri.trim();
  if (uriTrimmed === '') {
    throw new Error('La URI de MongoDB no puede estar vacía');
  }
  
  // Intentar parsear con URL para extraer pathname
  try {
    // MongoDB URI puede no tener // después de mongodb: en algunos casos, pero lo estándar sí
    let urlString = uriTrimmed;
    // Asegurarnos de que tenga // para parsear correctamente con URL
    if (urlString.startsWith('mongodb://')) {
      // URL puede parsearlo directamente
    } else if (urlString.startsWith('mongodb:') && !urlString.startsWith('mongodb://')) {
      // Caso raro, intentar añadir //
      urlString = uriTrimmed.replace('mongodb:', 'mongodb://');
    }
    
    const url = new URL(urlString);
    let pathname = url.pathname;
    
    // Quitar slash inicial
    if (pathname.startsWith('/')) {
      pathname = pathname.substring(1);
    }
    
    // Quitar slash final si existe
    if (pathname.endsWith('/')) {
      pathname = pathname.substring(0, pathname.length - 1);
    }
    
    // Si no hay nombre de base (pathname vacío o solo contiene caracteres de auth?), fallar
    if (pathname === '') {
      throw new Error('No se ha especificado el nombre de la base de datos en la URI de MongoDB');
    }
    
    // El nombre de la base es el primer segmento (antes de cualquier / extra)
    // En MongoDB, el pathname es /dbName o /dbName/collection? no, pero en URI de conexión es solo dbName
    const segmentos = pathname.split('/');
    const nombreBase = segmentos[0];
    
    if (!nombreBase || nombreBase === '') {
      throw new Error('No se ha especificado el nombre de la base de datos en la URI de MongoDB');
    }
    
    return nombreBase;
  } catch (error) {
    // Si URL falla, intentar parseo manual
    try {
      // Buscar patrón: ://host:port/dbName o @host:port/dbName
      // Extraer todo después del último :port hasta ? o #
      let resto = uriTrimmed;
      
      // Quitar query string y fragment
      if (resto.includes('?')) {
        resto = resto.split('?')[0];
      }
      if (resto.includes('#')) {
        resto = resto.split('#')[0];
      }
      
      // Buscar la última / que indique el inicio del nombre de la base
      const ultimaBarra = resto.lastIndexOf('/');
      if (ultimaBarra === -1) {
        throw new Error('No se ha encontrado el nombre de la base de datos en la URI de MongoDB');
      }
      
      const nombreBase = resto.substring(ultimaBarra + 1);
      if (!nombreBase || nombreBase === '') {
        throw new Error('No se ha especificado el nombre de la base de datos en la URI de MongoDB');
      }
      
      return nombreBase;
    } catch (errorManual) {
      throw new Error('No se ha podido parsear la URI de MongoDB');
    }
  }
}

function verificarUriScratch(uri) {
  const nombreBase = extraerNombreBaseDeDatos(uri);
  
  // Exigir coincidencia EXACTA con onepiece_agente_scratch
  if (nombreBase !== 'onepiece_agente_scratch') {
    throw new Error(
      'Los tests solo pueden correr contra onepiece_agente_scratch. ' +
      'El nombre de la base de datos debe ser EXACTAMENTE "onepiece_agente_scratch". ' +
      'Ejecuta: MONGODB_URI=mongodb://127.0.0.1:27017/onepiece_agente_scratch npm test'
    );
  }
  
  return true;
}

module.exports = { verificarUriScratch, extraerNombreBaseDeDatos };
