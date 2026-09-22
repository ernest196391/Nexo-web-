import { parecido } from './aprendizaje.js';
import { UMBRAL_DIRECTO } from './umbrales.js';

// Mide si el diccionario de sinónimos distingue preguntas iguales de preguntas
// que solo se PARECEN. Si tocas sinonimos.js, corre esto: mientras no confunda
// ninguna al umbral directo, vas bien.

// Pares que SÍ son la misma pregunta
const iguales = [
  ['¿Cuánto cuesta llevar un paquete a Playa?', 'cuanto vale mandar algo para playa?'],
  ['¿Hacen páginas web?', 'ustedes hacen sitios web?'],
  ['¿Cuánto demora la entrega?', 'en cuanto tiempo llega el pedido'],
  ['¿Qué horario tienen?', 'a que hora abren'],
  ['quiero hablar con alguien', 'me pueden atender una persona'],
  ['¿Tienen disponible el modelo azul?', 'hay del azul?'],
];

// Pares que PARECEN iguales pero NO lo son: cambia el dato que importa
const distintos = [
  ['¿Cuánto cuesta un paquete a Playa?', '¿Cuánto cuesta un paquete a Vedado?'],
  ['¿Cuánto cuesta el envío a Habana?', '¿Cuánto cuesta el envío a Santiago?'],
  ['¿Tienen disponible el modelo azul?', '¿Tienen disponible el modelo rojo?'],
  ['¿Cuánto demora a Playa?', '¿Cuánto cuesta a Playa?'],
  ['¿Hacen páginas web?', '¿Hacen envíos?'],
  ['quiero pagar por transferencia', 'quiero hablar con alguien'],
];

const p = (arr) => arr.map(([a, b]) => ({ a, b, s: parecido(a, b) }));
const A = p(iguales), B = p(distintos);

console.log('MISMA pregunta (queremos alto):');
A.sort((x,y)=>y.s-x.s).forEach(r => console.log(`  ${r.s.toFixed(2)}  ${r.a}  ≈  ${r.b}`));
console.log('\nDISTINTA pregunta (queremos bajo):');
B.sort((x,y)=>y.s-x.s).forEach(r => console.log(`  ${r.s.toFixed(2)}  ${r.a}  ≠  ${r.b}`));

const minIgual = Math.min(...A.map(r=>r.s)), maxDistinto = Math.max(...B.map(r=>r.s));
console.log(`\nmás bajo de los iguales : ${minIgual.toFixed(2)}`);
console.log(`más alto de los distintos: ${maxDistinto.toFixed(2)}`);
console.log(minIgual > maxDistinto
  ? `→ se separan limpio. Umbral seguro entre ${maxDistinto.toFixed(2)} y ${minIgual.toFixed(2)}`
  : `→ SE SOLAPAN. No hay umbral que acierte siempre: responder directo es arriesgado.`);

console.log('');
for (const u of [0.95, 0.90, 0.85, 0.80, 0.70, 0.60, 0.50, 0.40]) {
  const aciertos = A.filter(r=>r.s>=u).length, errores = B.filter(r=>r.s>=u).length;
  const marca = Math.abs(u - UMBRAL_DIRECTO) < 1e-9 ? '  ← el que usa el bot' : '';
  console.log(`  umbral ${u.toFixed(2)}: reconoce ${aciertos}/${A.length} iguales, confunde ${errores}/${B.length} distintos${marca}`);
}

const confunde = B.filter((r) => r.s >= UMBRAL_DIRECTO);
console.log('');
if (confunde.length) {
  console.log(`FALLA: al umbral ${UMBRAL_DIRECTO} confunde ${confunde.length} pregunta(s) distinta(s):`);
  confunde.forEach((r) => console.log(`  ${r.s.toFixed(2)}  ${r.a}  ≠  ${r.b}`));
  process.exit(1);
}
console.log(`CORRECTO: al umbral ${UMBRAL_DIRECTO} no confunde ninguna pregunta distinta.`);
