#!/usr/bin/env node
import 'dotenv/config';
import { abrir, negocios, datos } from './db.js';
import { revisar } from './aprendizaje.js';
import { listarModelos, descripcion } from './proveedor.js';

const db = abrir(process.env.BASE_DATOS || 'datos/nexo.db');
const N = negocios(db), D = datos(db);
const [orden, ...args] = process.argv.slice(2);

const buscarNegocio = (ref) => {
  const porNum = N.porNumero(ref);
  if (porNum) return porNum;
  const todos = N.todos();
  return todos.find((n) => String(n.id) === ref)
      || todos.find((n) => n.nombre.toLowerCase() === String(ref).toLowerCase());
};

const exigir = (ref) => {
  const n = buscarNegocio(ref);
  if (!n) { console.error(`No encuentro el negocio "${ref}". Corre: npm run negocios`); process.exit(1); }
  return n;
};

const AYUDA = `
Negocios y aprendizaje

  node src/gestionar.js listar
  node src/gestionar.js añadir "Nombre" 5350000000 ["qué vende"] ["cómo habla"] [web]
  node src/gestionar.js editar <negocio> <campo> <valor>      campos: nombre descripcion tono web activo
  node src/gestionar.js borrar <negocio>

  node src/gestionar.js dato <negocio> "<clave>" "<valor>"    ej: dato 2 "precio Habana" "500 CUP"
  node src/gestionar.js datos <negocio>
  node src/gestionar.js quitar-dato <negocio> "<clave>"

  node src/gestionar.js revisar <negocio>       lo que aprendió de ti, sin revisar
  node src/gestionar.js aprobar <id>            marcarlo como bueno (se usa con más confianza)
  node src/gestionar.js descartar <id>          que no lo vuelva a usar
  node src/gestionar.js sabidos <negocio>       lo ya aprobado

  node src/gestionar.js modelos                 modelos que tu clave puede usar

<negocio> puede ser el número, el id o el nombre.
`.trim();

const recorte = (t, n = 68) => (t.length > n ? t.slice(0, n - 1) + '…' : t).replace(/\n/g, ' ⏎ ');

switch (orden) {
  case 'listar': {
    const todos = N.todos();
    if (!todos.length) { console.log('Todavía no hay ningún negocio. Añade uno con "añadir".'); break; }
    for (const n of todos) {
      const c = revisar(db).contar(n.id);
      const resumen = c.map((x) => `${x.n} ${x.estado}`).join(', ') || 'nada aprendido aún';
      console.log(`[${n.id}] ${n.activo ? '●' : '○'} ${n.nombre}  +${n.numero}`);
      console.log(`      ${D.lista(n.id).length} datos · ${resumen}`);
    }
    break;
  }

  case 'añadir': case 'anadir': {
    const [nombre, numero, descripcion = '', tono = '', web = ''] = args;
    if (!nombre || !numero) { console.error('Faltan el nombre y el número.\n\n' + AYUDA); process.exit(1); }
    if (N.porNumero(numero)) { console.error(`Ya hay un negocio con el número ${numero}.`); process.exit(1); }
    const n = N.crear({ nombre, numero, descripcion, tono, web });
    console.log(`Añadido [${n.id}] ${n.nombre} +${n.numero}`);
    console.log(`Ahora ponle datos:  node src/gestionar.js dato ${n.id} "horario" "9am a 6pm"`);
    console.log(`Y arranca el bot:   npm start   (te pedirá el QR de ese número)`);
    break;
  }

  case 'editar': {
    const n = exigir(args[0]);
    N.editar(n.id, { [args[1]]: args[1] === 'activo' ? Number(args[2]) : args[2] });
    console.log(`[${n.id}] ${n.nombre}: ${args[1]} actualizado.`);
    break;
  }

  case 'borrar': {
    const n = exigir(args[0]);
    N.borrar(n.id);
    console.log(`Borrado ${n.nombre} y todo lo que había aprendido de él.`);
    break;
  }

  case 'dato': {
    const n = exigir(args[0]);
    D.poner(n.id, args[1], args[2]);
    console.log(`[${n.nombre}] ${args[1]} = ${args[2]}`);
    break;
  }

  case 'datos': {
    const n = exigir(args[0]);
    const lista = D.lista(n.id);
    console.log(`${n.nombre} — ${lista.length} datos`);
    lista.forEach((d) => console.log(`  ${d.clave}: ${d.valor}`));
    break;
  }

  case 'quitar-dato': {
    const n = exigir(args[0]);
    D.quitar(n.id, args[1]);
    console.log(`Quitado "${args[1]}" de ${n.nombre}.`);
    break;
  }

  case 'revisar': {
    const n = exigir(args[0]);
    const p = revisar(db).pendientes(n.id);
    if (!p.length) { console.log(`${n.nombre}: nada pendiente de revisar.`); break; }
    console.log(`${n.nombre} — ${p.length} respuestas tuyas sin revisar:\n`);
    for (const e of p) {
      console.log(`[${e.id}]  cliente: ${recorte(e.pregunta)}`);
      console.log(`      tú: ${recorte(e.respuesta)}`);
      console.log(`      usada ${e.usado} veces · ${e.creado}\n`);
    }
    console.log('Aprobar una:   node src/gestionar.js aprobar <id>');
    console.log('Descartarla:   node src/gestionar.js descartar <id>');
    console.log('\nAprobada, el bot la reutiliza con más confianza. Sin revisar la usa igual,');
    console.log('pero solo si la pregunta es casi idéntica.');
    break;
  }

  case 'sabidos': {
    const n = exigir(args[0]);
    const a = revisar(db).aprobados(n.id);
    console.log(`${n.nombre} — ${a.length} respuestas aprobadas (las más usadas primero):\n`);
    a.forEach((e) => console.log(`[${e.id}] (${e.usado}×) ${recorte(e.pregunta, 45)}\n      → ${recorte(e.respuesta)}\n`));
    break;
  }

  case 'aprobar':
    revisar(db).aprobar(Number(args[0]));
    console.log(`Aprobado el ${args[0]}.`);
    break;

  case 'descartar':
    revisar(db).descartar(Number(args[0]));
    console.log(`Descartado el ${args[0]}. No lo volverá a usar.`);
    break;

  case 'modelos':
    console.log(`Configurado ahora: ${descripcion()}\n`);
    try {
      const m = await listarModelos();
      console.log(`Tu clave puede usar ${m.length} modelos:`);
      m.forEach((x) => console.log(`  ${x}`));
      console.log('\nPon el que quieras en IA_MODELO, dentro de .env');
    } catch (e) {
      console.error(`No pude preguntarle al proveedor: ${e.message}`);
      if (e.status === 401) console.error('→ La clave no es válida.');
      if (e.status === 403) console.error('→ Acceso denegado. Puede ser el bloqueo por país.');
      process.exit(1);
    }
    break;

  default:
    console.log(AYUDA);
}
