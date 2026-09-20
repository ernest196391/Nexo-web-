// Prueba las reglas sin tocar WhatsApp ni la API.
process.env.ANTHROPIC_API_KEY = '';
const { responder } = await import('./cerebro.js');
const casos = [
  'Hola buenas',
  '¿Cuánto cuesta?',
  'que hacen ustedes',
  'pasame el link de la pagina',
  'quiero hablar con una persona',
  'Tengo una cafetería y quiero vender por internet pero no sé por dónde empezar',
];
for (const c of casos) {
  const r = await responder(c);
  console.log('—'.repeat(60));
  console.log('IN :', c);
  console.log('VIA:', r.via, r.pasarAHumano ? '(pasa a humano)' : '');
  console.log('OUT:', r.texto);
}
