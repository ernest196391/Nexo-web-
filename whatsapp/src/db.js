import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// Base local en un solo archivo. Sin servidor, sin internet: el bot sigue
// funcionando con la luz y sin conexión, que es lo que hace falta aquí.
// node:sqlite viene dentro de Node, así que no hay nada que instalar.

const ESQUEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS negocio (
  id          INTEGER PRIMARY KEY,
  nombre      TEXT NOT NULL,
  numero      TEXT NOT NULL UNIQUE,          -- su WhatsApp, solo dígitos
  activo      INTEGER NOT NULL DEFAULT 1,
  descripcion TEXT NOT NULL DEFAULT '',      -- qué vende, en prosa
  tono        TEXT NOT NULL DEFAULT '',      -- cómo habla con sus clientes
  web         TEXT NOT NULL DEFAULT '',
  creado      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Lo que el bot debe saber de cada negocio: precios, horarios, zonas de envío…
CREATE TABLE IF NOT EXISTS dato (
  id         INTEGER PRIMARY KEY,
  negocio_id INTEGER NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
  clave      TEXT NOT NULL,
  valor      TEXT NOT NULL,
  UNIQUE(negocio_id, clave)
);

-- El corazón del asunto: cómo respondes TÚ de verdad.
CREATE TABLE IF NOT EXISTS ejemplo (
  id         INTEGER PRIMARY KEY,
  negocio_id INTEGER NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
  pregunta   TEXT NOT NULL,
  respuesta  TEXT NOT NULL,
  estado     TEXT NOT NULL DEFAULT 'nuevo',  -- nuevo | aprobado | descartado
  usado      INTEGER NOT NULL DEFAULT 0,
  creado     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Búsqueda por texto sobre las preguntas, sin acentos ni mayúsculas.
CREATE VIRTUAL TABLE IF NOT EXISTS ejemplo_fts USING fts5(
  pregunta,
  content='ejemplo',
  content_rowid='id',
  tokenize="unicode61 remove_diacritics 2"
);
CREATE TRIGGER IF NOT EXISTS ejemplo_ai AFTER INSERT ON ejemplo BEGIN
  INSERT INTO ejemplo_fts(rowid, pregunta) VALUES (new.id, new.pregunta);
END;
CREATE TRIGGER IF NOT EXISTS ejemplo_ad AFTER DELETE ON ejemplo BEGIN
  INSERT INTO ejemplo_fts(ejemplo_fts, rowid, pregunta) VALUES ('delete', old.id, old.pregunta);
END;
CREATE TRIGGER IF NOT EXISTS ejemplo_au AFTER UPDATE OF pregunta ON ejemplo BEGIN
  INSERT INTO ejemplo_fts(ejemplo_fts, rowid, pregunta) VALUES ('delete', old.id, old.pregunta);
  INSERT INTO ejemplo_fts(rowid, pregunta) VALUES (new.id, new.pregunta);
END;

CREATE TABLE IF NOT EXISTS contacto (
  id                INTEGER PRIMARY KEY,
  negocio_id        INTEGER NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
  jid               TEXT NOT NULL,
  nombre            TEXT NOT NULL DEFAULT '',
  silenciado_hasta  TEXT,
  visto             TEXT,
  UNIQUE(negocio_id, jid)
);

CREATE TABLE IF NOT EXISTS mensaje (
  id         INTEGER PRIMARY KEY,
  negocio_id INTEGER NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
  jid        TEXT NOT NULL,
  autor      TEXT NOT NULL,                  -- cliente | bot | humano
  texto      TEXT NOT NULL,
  via        TEXT NOT NULL DEFAULT '',
  creado     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS mensaje_chat ON mensaje(negocio_id, jid, id);
`;

export function abrir(ruta = 'datos/nexo.db') {
  if (ruta !== ':memory:') mkdirSync(dirname(ruta), { recursive: true });
  const db = new DatabaseSync(ruta);
  db.exec(ESQUEMA);
  return db;
}

// ---------- negocios ----------

export const negocios = (db) => ({
  crear({ nombre, numero, descripcion = '', tono = '', web = '' }) {
    const n = String(numero).replace(/\D/g, '');
    db.prepare(`INSERT INTO negocio (nombre, numero, descripcion, tono, web)
                VALUES (?, ?, ?, ?, ?)`).run(nombre, n, descripcion, tono, web);
    return this.porNumero(n);
  },
  porNumero: (numero) =>
    db.prepare('SELECT * FROM negocio WHERE numero = ?').get(String(numero).replace(/\D/g, '')),
  porId: (id) => db.prepare('SELECT * FROM negocio WHERE id = ?').get(id),
  activos: () => db.prepare('SELECT * FROM negocio WHERE activo = 1 ORDER BY nombre').all(),
  todos: () => db.prepare('SELECT * FROM negocio ORDER BY nombre').all(),
  editar(id, campos) {
    const permitidos = ['nombre', 'descripcion', 'tono', 'web', 'activo'];
    const set = Object.keys(campos).filter((k) => permitidos.includes(k));
    if (!set.length) return;
    db.prepare(`UPDATE negocio SET ${set.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`)
      .run(...set.map((k) => campos[k]), id);
  },
  borrar: (id) => db.prepare('DELETE FROM negocio WHERE id = ?').run(id),
});

// ---------- datos del negocio ----------

export const datos = (db) => ({
  poner(negocioId, clave, valor) {
    db.prepare(`INSERT INTO dato (negocio_id, clave, valor) VALUES (?, ?, ?)
                ON CONFLICT(negocio_id, clave) DO UPDATE SET valor = excluded.valor`)
      .run(negocioId, clave, valor);
  },
  quitar: (negocioId, clave) =>
    db.prepare('DELETE FROM dato WHERE negocio_id = ? AND clave = ?').run(negocioId, clave),
  lista: (negocioId) =>
    db.prepare('SELECT clave, valor FROM dato WHERE negocio_id = ? ORDER BY clave').all(negocioId),
});

// ---------- conversación ----------

export const mensajes = (db) => ({
  anotar: (negocioId, jid, autor, texto, via = '') =>
    db.prepare('INSERT INTO mensaje (negocio_id, jid, autor, texto, via) VALUES (?, ?, ?, ?, ?)')
      .run(negocioId, jid, autor, texto, via),

  ultimos: (negocioId, jid, n = 8) =>
    db.prepare(`SELECT autor, texto FROM mensaje WHERE negocio_id = ? AND jid = ?
                ORDER BY id DESC LIMIT ?`).all(negocioId, jid, n).reverse(),

  // El último mensaje del cliente en ese chat, para emparejarlo con tu respuesta.
  ultimoDelCliente: (negocioId, jid) =>
    db.prepare(`SELECT * FROM mensaje WHERE negocio_id = ? AND jid = ? AND autor = 'cliente'
                ORDER BY id DESC LIMIT 1`).get(negocioId, jid),

  // ¿Respondió ya alguien (bot o tú) después de ese mensaje del cliente?
  hayRespuestaDespues: (negocioId, jid, desdeId) =>
    db.prepare(`SELECT COUNT(*) n FROM mensaje WHERE negocio_id = ? AND jid = ?
                AND id > ? AND autor IN ('bot','humano')`).get(negocioId, jid, desdeId).n > 0,
});

export const contactos = (db) => ({
  ver: (negocioId, jid) =>
    db.prepare('SELECT * FROM contacto WHERE negocio_id = ? AND jid = ?').get(negocioId, jid),
  tocar(negocioId, jid, nombre = '') {
    db.prepare(`INSERT INTO contacto (negocio_id, jid, nombre, visto)
                VALUES (?, ?, ?, datetime('now'))
                ON CONFLICT(negocio_id, jid) DO UPDATE SET
                  visto = datetime('now'),
                  nombre = CASE WHEN excluded.nombre <> '' THEN excluded.nombre ELSE contacto.nombre END`)
      .run(negocioId, jid, nombre);
  },
  silenciar(negocioId, jid, minutos) {
    this.tocar(negocioId, jid);
    db.prepare(`UPDATE contacto SET silenciado_hasta = datetime('now', ?)
                WHERE negocio_id = ? AND jid = ?`).run(`+${minutos} minutes`, negocioId, jid);
  },
  estaSilenciado(negocioId, jid) {
    const r = db.prepare(`SELECT silenciado_hasta > datetime('now') AS si
                          FROM contacto WHERE negocio_id = ? AND jid = ?`).get(negocioId, jid);
    return !!r?.si;
  },
});
