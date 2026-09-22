import { crearGuardia } from './guardia.js';
const base = { listaBlanca: [], esperaMinMs: 2500, esperaMaxMs: 6000,
               topeContactoHora: 3, topeGlobalHora: 4, silencioMin: 30 };
let fallos = 0;
const p = (g, jid, n, etiq, esperado) => {
  const r = g.permite(jid, n);
  const bien = r.ok === esperado;
  if (!bien) fallos++;
  console.log(`${bien ? 'ok  ' : 'FALLA'} ${etiq.padEnd(42)} ${r.ok ? 'SÍ' : 'NO — ' + r.motivo}`);
  return r.ok;
};

const A = '5354056173@s.whatsapp.net', B = '5355555555@s.whatsapp.net';

console.log('== solo se responde a quien escribió primero ==');
const g1 = crearGuardia(base);
p(g1, A, '5354056173', 'no ha escrito', false);
g1.marcarEntrante(A);
p(g1, A, '5354056173', 'ya escribió', true);

console.log('\n== lista blanca ==');
const g2 = crearGuardia({ ...base, listaBlanca: ['5354056173'] });
g2.marcarEntrante(A); g2.marcarEntrante(B);
p(g2, A, '5354056173', 'dentro de la lista', true);
p(g2, B, '5355555555', 'fuera de la lista', false);

console.log('\n== tope por contacto (3/hora) ==');
const g3 = crearGuardia(base);
g3.marcarEntrante(A);
for (let i = 1; i <= 4; i++) if (p(g3, A, '5354056173', `envío nº${i}`, i <= 3)) g3.anotaEnvio(A);

console.log('\n== tope global (4/hora, contactos distintos) ==');
const g4 = crearGuardia(base);
for (let i = 1; i <= 5; i++) {
  const j = `5350000${i}@s.whatsapp.net`;
  g4.marcarEntrante(j);
  if (p(g4, j, `5350000${i}`, `contacto nº${i}`, i <= 4)) g4.anotaEnvio(j);
}
// El silencio (cuando estás tú atendiendo un chat) ya no vive aquí: pasó a la
// base de datos para que sobreviva a los reinicios. Se comprueba en cerebro.prueba.mjs.


console.log('\n== espera al azar ==');
const e = Array.from({ length: 8 }, () => g1.esperaHumana());
const dentro = e.every((v) => v >= 2500 && v <= 6000);
if (!dentro) fallos++;
console.log(`${dentro ? 'ok  ' : 'FALLA'} ${String(e.length + ' muestras entre 2500 y 6000 ms').padEnd(42)} ${e.join(', ')}`);

console.log(`\n${fallos === 0 ? 'TODO CORRECTO' : fallos + ' FALLOS'}`);
process.exit(fallos ? 1 : 0);
