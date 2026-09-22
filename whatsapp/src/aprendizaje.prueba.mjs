import { abrir, negocios, datos, mensajes } from './db.js';
import { capturar, buscar, parecido, revisar } from './aprendizaje.js';

let fallos = 0;
const ok = (cond, etiq, extra = '') => {
  if (!cond) fallos++;
  console.log(`${cond ? 'ok   ' : 'FALLA'} ${etiq}${extra ? '  → ' + extra : ''}`);
};

const db = abrir(':memory:');
const N = negocios(db), M = mensajes(db);

const nexo = N.crear({ nombre: 'NEXO', numero: '5354056173' });
const msj = N.crear({ nombre: 'Mensajería', numero: '5351112233' });
ok(nexo.id !== msj.id, 'dos negocios distintos', `${nexo.nombre}=${nexo.id}, ${msj.nombre}=${msj.id}`);
ok(N.porNumero('+53 5405 6173')?.id === nexo.id, 'busca el negocio por número con formato');
ok(N.activos().length === 2, 'los dos salen como activos');

datos(db).poner(msj.id, 'precio Habana', '500 CUP dentro de La Habana');
ok(datos(db).lista(msj.id)[0].valor.includes('500'), 'guarda un dato del negocio');

// --- El cliente pregunta y respondes tú a mano ---
const chat = '5355550001@s.whatsapp.net';
M.anotar(msj.id, chat, 'cliente', '¿Cuánto cuesta llevar un paquete a Playa?');
const e1 = capturar(db, msj.id, chat, 'A Playa son 500 CUP y llega el mismo día si lo mandas antes de las 3.');
ok(!!e1, 'captura tu respuesta manual');
ok(e1.pregunta.includes('Playa'), 'la empareja con la pregunta del cliente');

// --- Basura que NO debe aprender ---
ok(capturar(db, msj.id, chat, 'ok') === null, 'no aprende de un "ok"');
ok(capturar(db, msj.id, chat, '/pausa') === null, 'no aprende de una orden');
const otro = '5355550002@s.whatsapp.net';
ok(capturar(db, msj.id, otro, 'Una respuesta larga sin pregunta previa') === null,
   'no aprende si nadie preguntó');

// --- Recuperación ---
M.anotar(msj.id, otro, 'cliente', 'cuanto vale mandar algo para playa?');
const r = buscar(db, msj.id, 'cuanto vale mandar algo para playa?');
ok(r.length > 0, 'encuentra la respuesta parecida');
ok(r[0]?.respuesta.includes('500 CUP'), 'y es la correcta', r[0]?.respuesta.slice(0, 40));
ok(r[0]?.parecido > 0.3, 'con un parecido razonable', `parecido=${r[0]?.parecido.toFixed(2)}`);

// --- Los negocios no se mezclan ---
ok(buscar(db, nexo.id, 'cuanto vale mandar algo para playa?').length === 0,
   'NEXO no ve lo que aprendió la mensajería');

// --- Acentos y mayúsculas ---
M.anotar(nexo.id, chat, 'cliente', '¿Hacen páginas web?');
capturar(db, nexo.id, chat, 'Sí, hacemos tiendas online y webs que venden. ¿Qué vendes tú?');
const r2 = buscar(db, nexo.id, 'HACEN PAGINAS WEB');
ok(r2[0]?.respuesta.includes('tiendas online'), 'encuentra sin acentos y en mayúsculas');

// --- Tu última versión manda ---
M.anotar(msj.id, chat, 'cliente', '¿Cuánto cuesta llevar un paquete a Playa?');
capturar(db, msj.id, chat, 'A Playa son 600 CUP desde este mes.');
const r3 = buscar(db, msj.id, 'cuanto cuesta a playa');
ok(r3[0]?.respuesta.includes('600'), 'tu corrección sustituye a la anterior', r3[0]?.respuesta);
ok(db.prepare('SELECT COUNT(*) n FROM ejemplo WHERE negocio_id = ?').get(msj.id).n === 1,
   'sin duplicar la misma pregunta');

// --- Revisión ---
const rev = revisar(db);
ok(rev.pendientes(msj.id).length === 1, 'queda pendiente de revisar');
rev.aprobar(r3[0].id);
ok(rev.aprobados(msj.id).length === 1, 'se puede aprobar');
rev.descartar(r3[0].id);
ok(buscar(db, msj.id, 'cuanto cuesta a playa').length === 0, 'lo descartado deja de usarse');

// --- Parecido ---
ok(parecido('cuanto cuesta el envio', 'cuanto cuesta el envio') === 1, 'idénticas = 1');
ok(parecido('cuanto cuesta el envio', 'que hora es') === 0, 'sin nada en común = 0');
ok(parecido('cuanto cuesta un envio a playa', 'precio envio playa') > 0.4, 'parecidas puntúan alto',
   parecido('cuanto cuesta un envio a playa', 'precio envio playa').toFixed(2));

console.log(`\n${fallos === 0 ? 'TODO CORRECTO' : fallos + ' FALLOS'}`);
process.exit(fallos ? 1 : 0);
