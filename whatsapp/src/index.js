import makeWASocket, {
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
  isJidGroup,
  isJidBroadcast,
  jidNormalizedUser,
} from 'baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';

import { config, avisos } from './config.js';
import { crearGuardia } from './guardia.js';
import { responder } from './cerebro.js';
import { anotar } from './registro.js';

const log = pino({ level: process.env.LOG || 'warn' });
const guardia = crearGuardia(config);
const historial = new Map();   // jid -> últimos turnos, para que la IA tenga contexto
const TURNOS = 8;

let pausado = false;
let yo = null;                 // jid propio: ahí se avisa cuando hace falta una persona

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const numeroDe = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

function textoDe(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    m.buttonsResponseMessage?.selectedDisplayText ||
    m.listResponseMessage?.title ||
    ''
  ).trim();
}

// Órdenes que escribes tú desde tu propio teléfono, en cualquier chat.
async function orden(sock, msg, texto) {
  const jid = msg.key.remoteJid;
  const di = (t) => sock.sendMessage(jid, { text: t });

  switch (texto.toLowerCase().split(/\s+/)[0]) {
    case '/pausa':
      pausado = true;
      await di('Bot en pausa. No responde a nadie hasta que escribas /sigue.');
      return true;
    case '/sigue':
      pausado = false;
      await di('Bot activo otra vez.');
      return true;
    case '/mudo':
      guardia.silenciar(jid);
      await di(`Me callo en este chat ${config.silencioMin} minutos. Habla tú.`);
      return true;
    case '/estado': {
      const e = guardia.estado();
      await di(
        `${pausado ? 'EN PAUSA' : 'Activo'}\n` +
        `Enviados la última hora: ${e.enviadosUltimaHora}/${e.topeGlobalHora}\n` +
        `Contactos en esta sesión: ${e.contactos}\n` +
        `Chats en manos de una persona: ${e.silenciados}\n` +
        `IA: ${config.apiKey ? config.modelo : 'sin clave, solo reglas'}\n` +
        `Lista blanca: ${config.listaBlanca.length ? config.listaBlanca.join(', ') : 'vacía (responde a todos)'}`
      );
      return true;
    }
    default:
      return false;
  }
}

async function atender(sock, msg) {
  const jid = msg.key.remoteJid;
  if (!jid || isJidGroup(jid) || isJidBroadcast(jid) || jid === 'status@broadcast') return;

  const texto = textoDe(msg);

  // Mensajes tuyos: solo miramos si son una orden. Nunca los contestamos.
  if (msg.key.fromMe) {
    if (texto.startsWith('/')) await orden(sock, msg, texto);
    return;
  }
  if (!texto) return;

  const numero = numeroDe(jid);
  guardia.marcarEntrante(jid);

  if (pausado) {
    await anotar({ tipo: 'ignorado', numero, texto, motivo: 'bot en pausa' });
    return;
  }

  const permiso = guardia.permite(jid, numero);
  if (!permiso.ok) {
    await anotar({ tipo: 'ignorado', numero, texto, motivo: permiso.motivo });
    console.log(`· ${numero}: ignorado (${permiso.motivo})`);
    return;
  }

  await anotar({ tipo: 'entra', numero, texto });
  console.log(`← ${numero}: ${texto}`);

  const previo = historial.get(jid) || [];
  const { texto: salida, via, pasarAHumano } = await responder(texto, previo);

  // Leer, "escribiendo…" y una pausa al azar: así se comporta una persona.
  try {
    await sock.readMessages([msg.key]);
    await sock.sendPresenceUpdate('composing', jid);
  } catch { /* si falla la presencia, da igual: se responde igual */ }
  await dormir(guardia.esperaHumana());
  try { await sock.sendPresenceUpdate('paused', jid); } catch {}

  await sock.sendMessage(jid, { text: salida });
  guardia.anotaEnvio(jid);

  historial.set(jid, [...previo, { role: 'user', content: texto }, { role: 'assistant', content: salida }].slice(-TURNOS));

  await anotar({ tipo: 'sale', numero, texto: salida, via, pasarAHumano });
  console.log(`→ ${numero}: ${salida.replace(/\n/g, ' ⏎ ')}  [${via}]`);

  if (pasarAHumano) {
    guardia.silenciar(jid);
    if (yo) {
      await sock.sendMessage(yo, {
        text: `🔔 Te necesitan en WhatsApp\n\nDe: +${numero}\nDijo: "${texto}"\n\n` +
              `Me callo con ese chat ${config.silencioMin} minutos.`,
      });
      guardia.anotaEnvio(yo);
    }
  }
}

async function arrancar() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, log) },
    logger: log,
    browser: Browsers.appropriate('Desktop'),
    // No marcamos el número como "en línea": el teléfono sigue recibiendo
    // sus notificaciones normales y tú puedes usar WhatsApp como siempre.
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect, qr } = u;

    if (qr) {
      console.log('\nEscanea esto desde el teléfono del número que vas a usar:');
      console.log('WhatsApp → Ajustes → Dispositivos vinculados → Vincular dispositivo\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      yo = jidNormalizedUser(sock.user?.id);
      console.log(`\n✓ Conectado como +${numeroDe(yo)} (${sock.user?.name || 'sin nombre'})`);
      console.log('  Órdenes desde tu teléfono, en cualquier chat: /pausa  /sigue  /mudo  /estado');
      avisos().forEach((a) => console.log(`  ⚠ ${a}`));
      console.log('');
    }

    if (connection === 'close') {
      const codigo = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (codigo === DisconnectReason.loggedOut) {
        console.log('\nLa sesión se cerró desde el teléfono. Borra la carpeta auth/ y vuelve a escanear:');
        console.log('  npm run desvincular && npm start\n');
        process.exit(0);
      }
      console.log(`Conexión caída (${codigo || 'sin código'}). Reconectando en 5 s…`);
      await dormir(5000);
      arrancar();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;   // 'append' es historial viejo, no se contesta
    for (const msg of messages) {
      try {
        await atender(sock, msg);
      } catch (e) {
        console.error('[atender]', e.message);
        await anotar({ tipo: 'error', detalle: e.message });
      }
    }
  });
}

console.log(`\n${config.negocio} · WhatsApp`);
console.log('El bot solo responde a quien escribe primero. Nunca inicia una conversación.\n');
arrancar().catch((e) => {
  console.error('No pudo arrancar:', e.message);
  process.exit(1);
});
