import { mensajes } from './db.js';
import { canonica } from './sinonimos.js';
import { UMBRAL_DIRECTO } from './umbrales.js';

// Aquí vive lo de "que aprenda de cómo yo respondo".
//
// La idea: cuando el bot no sabe, se calla y respondes tú desde el teléfono.
// El bot ve tu respuesta, la empareja con lo que había preguntado el cliente y
// se la guarda. La próxima vez que alguien pregunte algo parecido, esa pareja
// vuelve — o como respuesta directa, o como ejemplo para que la IA copie tu
// forma de hablar. Cada vez que atiendes a alguien, el bot mejora.

const VACIAS = new Set([
  'a','al','ante','como','con','cual','cuales','cuanto','cuanta','cuantos','de','del','desde','donde',
  'el','ella','ellos','en','es','esa','ese','eso','esta','este','esto','la','las','le','lo','los',
  'mas','me','mi','muy','no','o','para','pero','por','porque','que','se','si','sin','sobre','su','sus',
  'te','tu','un','una','uno','unos','unas','y','ya','yo','usted','ustedes','hola',
  'pueden','puede','podria','podrian','favor','buenas','dias','tardes','noches',
]);

export const limpiar = (t) =>
  String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();

export function fichas(texto) {
  return limpiar(texto)
    .split(' ')
    .filter((p) => p.length > 2 && !VACIAS.has(p))
    .map(canonica);
}

// Coeficiente de Dice: 1 = idénticas, 0 = nada en común. Es interpretable,
// que es lo que hace falta para poder poner un umbral con sentido.
export function parecido(a, b) {
  const A = new Set(fichas(a)), B = new Set(fichas(b));
  if (!A.size || !B.size) return 0;
  let comunes = 0;
  for (const p of A) if (B.has(p)) comunes++;
  return (2 * comunes) / (A.size + B.size);
}

const NO_VALE = /^(ok|oki|okey|vale|listo|dale|si|no|gracias|de nada|👍|👌|ya|ahi|bien)$/i;

/**
 * Guarda lo que respondiste tú a mano. Devuelve el ejemplo o null si no vale.
 */
export function capturar(db, negocioId, jid, respuesta) {
  const texto = String(respuesta || '').trim();
  if (!texto || texto.startsWith('/') || texto.length < 12 || NO_VALE.test(texto)) return null;

  const pregunta = mensajes(db).ultimoDelCliente(negocioId, jid);
  if (!pregunta) return null;                       // respondiste sin que nadie preguntara
  if (!fichas(pregunta.texto).length) return null;  // "hola" suelto no enseña nada

  // Si ya hay guardada una pregunta que significa lo mismo, se ACTUALIZA esa.
  // Comparar el texto exacto no sirve: "cuánto cuesta a Playa" y "qué vale
  // mandar algo para Playa" son la misma pregunta, y si se guardan por separado
  // tu corrección de hoy convive con tu respuesta de hace un mes.
  const [similar] = buscar(db, negocioId, pregunta.texto, 1);
  if (similar && similar.parecido >= UMBRAL_DIRECTO) {
    db.prepare(`UPDATE ejemplo SET respuesta = ?, estado = 'nuevo' WHERE id = ?`)
      .run(texto, similar.id);
    return db.prepare('SELECT * FROM ejemplo WHERE id = ?').get(similar.id);
  }

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO ejemplo (negocio_id, pregunta, respuesta) VALUES (?, ?, ?)'
  ).run(negocioId, pregunta.texto, texto);
  return db.prepare('SELECT * FROM ejemplo WHERE id = ?').get(lastInsertRowid);
}

/**
 * Busca respuestas tuyas parecidas a lo que acaban de preguntar.
 * FTS5 saca los candidatos y luego se puntúan por parecido real.
 */
export function buscar(db, negocioId, texto, limite = 3) {
  const palabras = fichas(texto);
  if (!palabras.length) return [];

  const consulta = palabras.map((p) => `"${p}"`).join(' OR ');
  let filas;
  try {
    filas = db.prepare(`
      SELECT e.* FROM ejemplo_fts f
      JOIN ejemplo e ON e.id = f.rowid
      WHERE ejemplo_fts MATCH ? AND e.negocio_id = ? AND e.estado <> 'descartado'
      ORDER BY rank LIMIT 25
    `).all(consulta, negocioId);
  } catch {
    // Si FTS5 se atraganta con algo raro, se busca a lo bruto. Es lento pero no falla.
    filas = db.prepare(
      `SELECT * FROM ejemplo WHERE negocio_id = ? AND estado <> 'descartado' LIMIT 500`
    ).all(negocioId);
  }

  return filas
    .map((e) => ({ ...e, parecido: parecido(texto, e.pregunta) }))
    .filter((e) => e.parecido > 0)
    // A igual parecido gana la MÁS RECIENTE, no la más usada: si corregiste algo
    // ayer, esa corrección tiene que pesar más que la respuesta vieja de siempre.
    .sort((a, b) => b.parecido - a.parecido || b.id - a.id)
    .slice(0, limite);
}

export function marcarUsado(db, id) {
  db.prepare('UPDATE ejemplo SET usado = usado + 1 WHERE id = ?').run(id);
}

export const revisar = (db) => ({
  pendientes: (negocioId) =>
    db.prepare(`SELECT * FROM ejemplo WHERE negocio_id = ? AND estado = 'nuevo'
                ORDER BY id DESC`).all(negocioId),
  aprobados: (negocioId) =>
    db.prepare(`SELECT * FROM ejemplo WHERE negocio_id = ? AND estado = 'aprobado'
                ORDER BY usado DESC, id DESC`).all(negocioId),
  aprobar: (id) => db.prepare(`UPDATE ejemplo SET estado = 'aprobado' WHERE id = ?`).run(id),
  descartar: (id) => db.prepare(`UPDATE ejemplo SET estado = 'descartado' WHERE id = ?`).run(id),
  contar: (negocioId) =>
    db.prepare(`SELECT estado, COUNT(*) n FROM ejemplo WHERE negocio_id = ?
                GROUP BY estado`).all(negocioId),
});
