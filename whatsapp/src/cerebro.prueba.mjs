// Recorre el ciclo completo sin WhatsApp y sin IA: llega un cliente, el bot no
// sabe, respondes tú, y la próxima vez ya sabe. Es la promesa del sistema, así
// que conviene que esté comprobada.
import { abrir, negocios, datos, mensajes, contactos } from './db.js';
import { capturar } from './aprendizaje.js';
import { responder } from './cerebro.js';

let fallos = 0;
const ok = (c, etiq, extra = '') => { if (!c) fallos++; console.log(`${c ? 'ok   ' : 'FALLA'} ${etiq}${extra ? '  → ' + extra : ''}`); };

const db = abrir(':memory:');
const N = negocios(db), M = mensajes(db), C = contactos(db);

const msj = N.crear({ nombre: 'Mensajería 23', numero: '5351112233',
  descripcion: 'Mensajería en La Habana.', web: 'https://ejemplo.cu' });
const tienda = N.crear({ nombre: 'Casa Viva', numero: '5354445566', descripcion: 'Tienda online.' });
datos(db).poner(msj.id, 'horario', 'Lunes a sábado de 9am a 6pm');

const chat = '5355550001@s.whatsapp.net';

console.log('--- 1. llega algo que nadie le enseñó ---');
M.anotar(msj.id, chat, 'cliente', '¿Cuánto cuesta llevar un paquete a Playa?');
let r = await responder(db, msj, chat, '¿Cuánto cuesta llevar un paquete a Playa?');
ok(r.pasarAHumano, 'se calla y te avisa', r.via);
ok(!/500|CUP/.test(r.texto), 'y no se inventa un precio');

console.log('\n--- 2. respondes tú a mano ---');
M.anotar(msj.id, chat, 'humano', 'A Playa son 500 CUP y llega el mismo día si lo mandas antes de las 3.');
const ap = capturar(db, msj.id, chat, 'A Playa son 500 CUP y llega el mismo día si lo mandas antes de las 3.');
ok(!!ap, 'lo aprende de ti');

console.log('\n--- 3. otro cliente pregunta lo mismo con otras palabras ---');
const chat2 = '5355550002@s.whatsapp.net';
M.anotar(msj.id, chat2, 'cliente', 'cuanto vale mandar algo para playa?');
r = await responder(db, msj, chat2, 'cuanto vale mandar algo para playa?');
ok(!r.pasarAHumano, 'ahora sí responde solo', r.via);
ok(r.texto.includes('500 CUP'), 'con tu respuesta, tal cual', r.texto.slice(0, 40));
ok(r.via.startsWith('aprendido:'), 'y deja constancia de que salió de ti', r.via);

console.log('\n--- 4. una pregunta que SOLO se parece ---');
M.anotar(msj.id, chat2, 'cliente', '¿Cuánto cuesta un paquete a Santiago?');
r = await responder(db, msj, chat2, '¿Cuánto cuesta un paquete a Santiago?');
ok(r.pasarAHumano, 'no aplica el precio de Playa a Santiago', r.via);
ok(!r.texto.includes('500'), 'prefiere callarse antes que dar un precio falso');

console.log('\n--- 5. los negocios no se mezclan ---');
M.anotar(tienda.id, chat, 'cliente', 'cuanto vale mandar algo para playa?');
r = await responder(db, tienda, chat, 'cuanto vale mandar algo para playa?');
ok(r.pasarAHumano, 'Casa Viva no sabe lo de la mensajería', r.via);

console.log('\n--- 6. tu corrección manda sobre lo aprendido ---');
M.anotar(msj.id, chat, 'cliente', 'cuanto vale mandar algo para playa?');
capturar(db, msj.id, chat, 'Cambió: a Playa son 600 CUP desde este mes.');
r = await responder(db, msj, chat2, 'cuanto vale mandar algo para playa?');
ok(r.texto.includes('600'), 'usa la corrección, no la vieja', r.texto.slice(0, 40));

console.log('\n--- 7. silencio cuando estás tú en el chat ---');
C.silenciar(msj.id, chat, 30);
ok(C.estaSilenciado(msj.id, chat), 'el chat queda en tus manos');
ok(!C.estaSilenciado(msj.id, chat2), 'y solo ese chat');
ok(!C.estaSilenciado(tienda.id, chat), 'el silencio es por negocio, no global');

console.log(`\n${fallos === 0 ? 'TODO CORRECTO' : fallos + ' FALLOS'}`);
process.exit(fallos ? 1 : 0);
