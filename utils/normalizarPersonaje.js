function esObjetoPlano(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function parsearComoJson(valor, campo) {
  try {
    return JSON.parse(valor);
  } catch (error) {
    throw new Error(`El campo '${campo}' debe ser un JSON válido`);
  }
}

function convertirBooleano(valor) {
  if (valor === 'true') return true;
  if (valor === 'false') return false;
  return valor;
}

function normalizarFrutaDiablo(valor) {
  if (!esObjetoPlano(valor)) {
    throw new Error("El campo 'frutaDiablo' debe ser un objeto con nombre, tipo y despertada");
  }

  return {
    nombre: valor.nombre === '' || valor.nombre === undefined ? null : valor.nombre,
    tipo: valor.tipo === '' || valor.tipo === undefined ? null : valor.tipo,
    despertada: convertirBooleano(valor.despertada ?? false)
  };
}

function normalizarListaJson(valor, campo) {
  if (!Array.isArray(valor)) {
    throw new Error(`El campo '${campo}' debe ser un array de strings`);
  }
  return valor.map((item) => String(item));
}

function normalizarPersonaje(bodyOrigen) {
  const datos = Object.assign({}, bodyOrigen || {});

  if (typeof datos.frutaDiablo === 'string') {
    datos.frutaDiablo = normalizarFrutaDiablo(parsearComoJson(datos.frutaDiablo, 'frutaDiablo'));
  }

  ['habilidades', 'arcos'].forEach((campo) => {
    if (typeof datos[campo] === 'string') {
      datos[campo] = normalizarListaJson(parsearComoJson(datos[campo], campo), campo);
    }
  });

  return datos;
}

module.exports = normalizarPersonaje;