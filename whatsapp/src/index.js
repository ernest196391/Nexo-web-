import makeWASocket, {
  useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion,
  DisconnectReason, Browsers, isJidGroup, isJidBroadcast, jidNormalizedUser,
} from 'baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';

import { config } from './config.js';
import { abrir, negocios, mensajes, contactos } from './db.js';
import { crearGuardia } from './guardia.js';
import { responder } from './cerebro.js';
import { capturar } from './aprendizaje.js';
import { descripcion } from './proveedor.js';

const log = pino({ level: process.env.LOG || 'silent' });
const db = abrir(process.env.BASE_DATOS || 'datos/nexo.db');
const M = mensajes(db), C = contactos(db);

let pausado = false;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const numeroDe = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

function textoDe(msg) {
  const m = msg.message;
  if (!m) return '';
  return (m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption ||
          m.videoMessage?.caption || m.documentMessage?.caption ||
          m.buttonsResponseMessage?.selectedDisplayText || m.listResponseMessage?.title || '').trim();
}

// ---------------------------------------------------------------- una sesión

function sesion(negocio) {
  const guardia = crearGuardia(config);
  const mios = new Set();          // ids de lo que mandó el bot, para no aprender de sí mismo
  const etiqueta = `${negocio.nombre}`;
  let sock = null, yo = null;

  const di = (t) => console.log(`[${etiqueta}] ${t}`);

  async function enviar(jid, texto) {
    const r = await sock.sendMessage(jid, { text: texto });
    if (r?.key?.id) {
      mios.add(r.key.id);
      if (mios.size > 500) mios.delete(mios.values().next().value);
    }
    guardia.anotaEnvio(jid);
    return r;
  }

  async function orden(jid, texto) {
    switch (texto.toLowerCase().split(/\s+/)[0]) {
      case '/pausa':  pausado = true;  await enviar(jid, 'Todos los bots en pausa. /sigue para volver.'); return true;
      case '/sigue':  pausado = false; await enviar(jid, 'Bots activos otra vez.'); return true;
      case '/mudo':
        C.silenciar(negocio.id, jid, config.silencioMin);
        await enviar(jid, `Me callo aquí ${config.silencioMin} minutos. Habla tú.`);
        return true;
      case '/estado': {
        const e = guardia.estado();
        const n = negocios(db).activos();
        await enviar(jid,
          `${pausado ? 'EN PAUSA' : 'Activo'} · ${negocio.nombre}\n` +
          `Negocios conectados: ${n.length}\n` +
          `Enviados esta hora: ${e.enviadosUltimaHora}/${e.topeGlobalHora}\n` +
          `Contactos en esta sesión: ${e.contactos}\n` +
          `IA: ${descripcion()}`);
        return true;
      }
      default: return false;
    }
  }

  async function atender(msg) {
    const jid = msg.key.remoteJid;
    if (!jid || isJidGroup(jid) || isJidBroadcast(jid) || jid === 'status@broadcast') return;
    const texto = textoDe(msg);
    if (!texto) return;

    // --- Mensajes tuyos ---
    if (msg.key.fromMe) {
      if (mios.has(msg.key.id)) return;              // lo mandó el bot, no tú
      if (texto.startsWith('/')) { await orden(jid, texto); return; }

      // Respondiste a mano. Eso es exactamente de lo que aprende.
      M.anotar(negocio.id, jid, 'humano', texto);
      C.silenciar(negocio.id, jid, config.silencioMin);   // estás tú, el bot se aparta
      const aprendido = capturar(db, negocio.id, jid, texto);
      if (aprendido) di(`aprendido de ti → "${aprendido.pregunta.slice(0, 44)}…"  [#${aprendido.id}]`);
      return;
    }

    // --- Mensajes de un cliente ---
    const numero = numeroDe(jid);
    guardia.marcarEntrante(jid);
    C.tocar(negocio.id, jid, msg.pushName || '');
    M.anotar(negocio.id, jid, 'cliente', texto);
    di(`← ${numero}: ${texto}`);

    if (pausado) return;
    if (C.estaSilenciado(negocio.id, jid)) { di(`· ${numero}: callado, estás tú en ese chat`); return; }

    const permiso = guardia.permite(jid, numero);
    if (!permiso.ok) { di(`· ${numero}: ignorado (${permiso.motivo})`); return; }

    const { texto: salida, via, pasarAHumano } = await responder(db, negocio, jid, texto);

    try {
      await sock.readMessages([msg.key]);
      await sock.sendPresenceUpdate('composing', jid);
    } catch {}
    await dormir(guardia.esperaHumana());
    try { await sock.sendPresenceUpdate('paused', jid); } catch {}

    await enviar(jid, salida);
    M.anotar(negocio.id, jid, 'bot', salida, via);
    di(`→ ${numero}: ${salida.replace(/\n/g, ' ⏎ ')}  [${via}]`);

    if (pasarAHumano) {
      C.silenciar(negocio.id, jid, config.silencioMin);
      if (yo) {
        await enviar(yo, `🔔 ${negocio.nombre} — te necesitan\n\nDe: +${numero}\n` +
                         `Dijo: "${texto}"\n\nResponde tú aquí: lo que escribas me lo aprendo.`);
      }
    }
  }

  async function conectar() {
    const { state, saveCreds } = await useMultiFileAuthState(`auth/${negocio.numero}`);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, log) },
      logger: log,
      browser: Browsers.appropriate('Desktop'),
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (u) => {
      const { connection, lastDisconnect, qr } = u;

      if (qr) {
        console.log(`\n── ${negocio.nombre} · +${negocio.numero} ──`);
        console.log('Escanea desde ESE teléfono: Ajustes → Dispositivos vinculados → Vincular\n');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'open') {
        yo = jidNormalizedUser(sock.user?.id);
        const conectado = numeroDe(yo);
        if (conectado !== negocio.numero) {
          di(`⚠ Escaneaste +${conectado}, pero este negocio está guardado como +${negocio.numero}.`);
          di(`  Corrige el número o desvincula: rm -rf auth/${negocio.numero}`);
        }
        di(`✓ conectado como +${conectado}`);
      }

      if (connection === 'close') {
        const codigo = new Boom(lastDisconnect?.error)?.output?.statusCode;
        if (codigo === DisconnectReason.loggedOut) {
          di(`sesión cerrada desde el teléfono. Para volver: rm -rf auth/${negocio.numero} && npm start`);
          return;
        }
        di(`conexión caída (${codigo || '?'}), reintento en 5 s`);
        await dormir(5000);
        conectar();
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        try { await atender(msg); }
        catch (e) { console.error(`[${etiqueta}] ${e.message}`); }
      }
    });
  }

  return { conectar };
}

// ---------------------------------------------------------------- arranque

const activos = negocios(db).activos();

console.log('\nWhatsApp · varios negocios en un solo sitio');
console.log('Solo responde a quien escribe primero. Nunca inicia una conversación.');
console.log(`IA: ${descripcion()}\n`);

if (!activos.length) {
  console.log('No hay ningún negocio dado de alta todavía. Empieza por:\n');
  console.log('  node src/gestionar.js añadir "NEXO" 5354056173 "Automatización, IA y software" "" "https://nexo-plan-veci.vercel.app"\n');
  process.exit(0);
}

console.log(`${activos.length} negocio(s): ${activos.map((n) => `${n.nombre} (+${n.numero})`).join(', ')}`);
console.log('Órdenes desde tu teléfono, en cualquier chat: /pausa  /sigue  /mudo  /estado\n');

for (const n of activos) sesion(n).conectar();
