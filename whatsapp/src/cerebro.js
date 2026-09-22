import { datos, mensajes } from './db.js';
import { buscar, marcarUsado } from './aprendizaje.js';
import { UMBRAL_DIRECTO, UMBRAL_SIN_REVISAR, UMBRAL_EJEMPLO } from './umbrales.js';
import { hayIA, preguntar, porQueNoHayIA } from './proveedor.js';

// Decide qué contestar, en este orden:
//   1. ¿Ya respondiste tú algo casi idéntico? → se usa tu respuesta tal cual.
//   2. ¿Hay IA disponible? → responde, copiando tu forma de hablar.
//   3. Si no → se calla y te avisa. Y cuando contestes, lo aprende.
//
// El orden importa: tu respuesta real siempre gana sobre lo que invente la IA.

const MARCA_HUMANO = '[PASAR A HUMANO]';

function fichaDelNegocio(db, negocio) {
  const lista = datos(db).lista(negocio.id);
  const partes = [`Negocio: ${negocio.nombre}`];
  if (negocio.descripcion) partes.push(negocio.descripcion);
  if (negocio.web) partes.push(`Web: ${negocio.web}`);
  if (lista.length) {
    partes.push('\nDatos:');
    for (const d of lista) partes.push(`- ${d.clave}: ${d.valor}`);
  }
  return partes.join('\n');
}

function instrucciones(negocio, ejemplos) {
  const tono = negocio.tono?.trim()
    || 'Directo y cálido, de tú. Nada corporativo.';

  let txt = `Atiendes el WhatsApp de ${negocio.nombre}. Hablas por mensaje de texto.

Cómo escribes: ${tono}
- Corto: dos o tres frases. Es WhatsApp, no un correo.
- Una sola pregunta por mensaje, y solo si de verdad hace falta.
- Sin emojis, salvo que la persona los use primero.
- Nunca digas que eres una IA. Si te lo preguntan directo, di que eres un
  asistente automático de ${negocio.nombre}.

Reglas:
- Responde SOLO con los datos del negocio que tienes abajo.
- Si te preguntan algo que no aparece ahí (un precio distinto, un plazo, una
  excepción), NO te lo inventes: di que lo confirma una persona enseguida.
- Cuando haga falta una persona (se quejan, negocian, piden hablar con alguien,
  o la cosa se enreda), termina con esta línea sola: ${MARCA_HUMANO}`;

  if (ejemplos.length) {
    txt += `\n\nAsí ha respondido el dueño a preguntas parecidas. Copia su forma\n`
         + `de hablar y, si el dato sirve, su contenido:\n`;
    for (const e of ejemplos) {
      txt += `\nCliente: ${e.pregunta}\nDueño: ${e.respuesta}\n`;
    }
  }
  return txt;
}

/**
 * @returns {{texto:string, via:string, pasarAHumano:boolean}}
 */
export async function responder(db, negocio, jid, texto) {
  const candidatos = buscar(db, negocio.id, texto, 3);
  const mejor = candidatos[0];

  // 1. Tu propia respuesta, si la pregunta es prácticamente la misma.
  if (mejor) {
    const umbral = mejor.estado === 'aprobado' ? UMBRAL_DIRECTO : UMBRAL_SIN_REVISAR;
    if (mejor.parecido >= umbral) {
      marcarUsado(db, mejor.id);
      return {
        texto: mejor.respuesta,
        via: `aprendido:${mejor.id}:${mejor.parecido.toFixed(2)}:${mejor.estado}`,
        pasarAHumano: false,
      };
    }
  }

  // 2. La IA, con tus respuestas parecidas delante como ejemplo.
  if (hayIA()) {
    const ejemplos = candidatos.filter((c) => c.parecido >= UMBRAL_EJEMPLO);
    const historial = mensajes(db).ultimos(negocio.id, jid, 8)
      .filter((m) => m.texto !== texto)
      .map((m) => ({ role: m.autor === 'cliente' ? 'user' : 'assistant', content: m.texto }));

    try {
      let salida = await preguntar({
        sistema: `${instrucciones(negocio, ejemplos)}\n\n---\n\n${fichaDelNegocio(db, negocio)}`,
        conversacion: [...historial, { role: 'user', content: texto }],
      });
      const pasar = salida.includes(MARCA_HUMANO);
      salida = salida.split(MARCA_HUMANO).join('').trim();
      if (!salida) return aHumano(negocio, 'ia:vacia');
      ejemplos.forEach((e) => marcarUsado(db, e.id));
      return { texto: salida, via: `ia:${ejemplos.length}ej`, pasarAHumano: pasar };
    } catch (e) {
      console.error(`[${negocio.nombre}] IA falló:`, e.message);
      return aHumano(negocio, `ia:error:${e.status || ''}${e.message.slice(0, 60)}`);
    }
  }

  // 3. Sin IA y sin nada parecido aprendido: se calla y avisa.
  //    No es un fallo, es el mecanismo: tú respondes y el bot lo aprende.
  return aHumano(negocio, `sin_respuesta:${porQueNoHayIA() || 'nada parecido aprendido'}`);
}

function aHumano(negocio, via) {
  const web = negocio.web ? `\n\nMientras, aquí está todo: ${negocio.web}` : '';
  return {
    texto: `Déjame confirmarte eso bien — te escribe alguien enseguida por aquí.${web}`,
    via,
    pasarAHumano: true,
  };
}
