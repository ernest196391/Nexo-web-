// La gente pregunta lo mismo de mil formas: "cuánto cuesta", "qué precio tiene",
// "en cuánto me sale". Sin esto, el bot trata cada forma como una pregunta
// distinta y no reconoce nada que ya le hayas enseñado.
//
// Cada línea agrupa palabras que significan lo mismo PARA UN NEGOCIO. La primera
// es la que manda. Añade las tuyas: es la forma más barata de que el bot
// entienda mejor, y no cuesta ni una llamada a ninguna API.

const GRUPOS = [
  ['precio', 'cuesta', 'cuestan', 'costar', 'cuesto', 'vale', 'valen', 'tarifa', 'tarifas',
   'cobran', 'cobra', 'costo', 'coste', 'precios', 'sale', 'importe'],
  ['envio', 'enviar', 'envios', 'mandar', 'manda', 'mando', 'llevar', 'lleva', 'llevan',
   'traer', 'trae', 'traen', 'entrega', 'entregar', 'entregas', 'despacho', 'delivery',
   'llega', 'llegar', 'llegan', 'recibir', 'recibo'],
  ['paquete', 'paquetes', 'encomienda', 'encomiendas', 'bulto', 'bultos', 'caja', 'cajas',
   'cosa', 'cosas', 'algo', 'articulo', 'articulos', 'producto', 'productos', 'mercancia'],
  ['pedido', 'pedidos', 'orden', 'ordenes', 'compra', 'compras', 'comprar'],
  ['pagar', 'pago', 'pagos', 'pagan', 'abonar', 'transferencia', 'transferir'],
  // Ojo: "cuánto" NO va aquí. Sirve igual para "cuánto cuesta" que para
  // "cuánto demora", así que meterlo confunde las dos preguntas.
  ['demora', 'demoran', 'tarda', 'tardan', 'tardar', 'demorar', 'plazo', 'plazos', 'rapido',
   'tiempo', 'cuando', 'demoro'],
  ['horario', 'horarios', 'hora', 'horas', 'abren', 'abre', 'cierran', 'cierra', 'abierto'],
  ['zona', 'zonas', 'municipio', 'municipios', 'reparto', 'repartos', 'barrio', 'direccion'],
  ['disponible', 'disponibles', 'hay', 'tienen', 'tiene', 'queda', 'quedan', 'existencia', 'stock'],
  ['web', 'pagina', 'paginas', 'sitio', 'link', 'enlace', 'catalogo', 'tienda'],
  ['ayuda', 'ayudar', 'ayudame', 'necesito', 'quiero', 'busco', 'quisiera'],
  ['persona', 'humano', 'alguien', 'atiendan', 'atienda', 'atender', 'atienden',
   'hablar', 'llamar', 'llamada'],
];

const MAPA = new Map();
for (const grupo of GRUPOS) for (const p of grupo) MAPA.set(p, grupo[0]);

/** Devuelve la palabra que representa al grupo, o la propia palabra. */
export function canonica(palabra) {
  if (MAPA.has(palabra)) return MAPA.get(palabra);
  // Plural sencillo: "envios" no está pero "envio" sí.
  if (palabra.endsWith('es') && MAPA.has(palabra.slice(0, -2))) return MAPA.get(palabra.slice(0, -2));
  if (palabra.endsWith('s') && MAPA.has(palabra.slice(0, -1))) return MAPA.get(palabra.slice(0, -1));
  return palabra;
}

export const grupos = GRUPOS;
