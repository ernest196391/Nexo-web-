import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';

// Lo que el bot sabe del negocio. Cambiar esto cambia lo que contesta:
// no hace falta tocar el código para adaptarlo a otro cliente.
const NEGOCIO = `
${config.negocio} convierte negocios en sistemas que venden, atienden y operan solos.

Qué hacemos:
- Tiendas online y webs que venden
- Ventas y atención por WhatsApp, automatizadas
- Agentes con inteligencia artificial
- Aplicaciones y sistemas a medida

Planes:
- Starter: $250 de instalación, $125/mes + 10% de comisión. Catálogo con carrito,
  WhatsApp automatizado 24/7 y soporte. Para quien arranca a vender online.
- Growth: $500 de instalación, $150/mes + 8%. Todo lo de Starter, más puente de
  cobro (la familia paga desde el exterior) y control de entregas.
- Full: $900 de instalación, $250/mes + 6%. Todo lo de Growth, más avatar con IA,
  contenido automatizado y apps a medida.
Si el caso no encaja en ninguno, se arma algo a medida.

Web: ${config.web}
`.trim();

const INSTRUCCIONES = `
Eres quien atiende el WhatsApp de ${config.negocio}. Hablas con dueños de
negocios en Cuba, por mensaje de texto.

Cómo escribes:
- En español, de tú, directo y cálido. Nada de corporativo.
- Corto: dos o tres frases. Es WhatsApp, no un correo.
- Una sola pregunta por mensaje, y solo si de verdad hace falta.
- Sin emojis, salvo que la persona los use primero.
- Nunca digas que eres una IA ni un bot, pero tampoco digas que eres una persona.
  Si te lo preguntan directo: "es un asistente automático de ${config.negocio}".

Qué haces:
- Respondes lo que preguntan usando SOLO lo que sabes del negocio.
- Si preguntan algo que no sabes (un precio distinto, un plazo, un caso raro),
  no te lo inventes: di que lo confirma una persona y que escribes enseguida.
- Si quieren empezar, pide lo mínimo: qué vende y qué le está costando más hoy.

Cuando haga falta una persona (piden hablar con alguien, se quejan, negocian
precio, o la cosa se enreda), termina tu mensaje con la línea exacta:
[PASAR A HUMANO]
Esa línea se borra antes de enviar. Escríbela sola, en la última línea.
`.trim();

const RESPUESTAS = [
  {
    nombre: 'saludo',
    prueba: /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|ola|saludos)\b/,
    texto: () =>
      `Hola, soy de ${config.negocio}. Hacemos que un negocio venda y atienda solo: ` +
      `tienda online, WhatsApp automatizado, agentes con IA y apps a medida.\n\n` +
      `¿Qué vendes tú?`,
  },
  {
    nombre: 'precios',
    prueba: /\b(precio|precios|cuanto cuesta|cuanto vale|cuanto es|tarifa|plan|planes|cobran|costo)\b/,
    texto: () =>
      `Tenemos tres planes:\n\n` +
      `Starter — $250 de instalación y $125/mes + 10%. Catálogo con carrito y WhatsApp automatizado.\n` +
      `Growth — $500 y $150/mes + 8%. Suma puente de cobro desde el exterior y control de entregas.\n` +
      `Full — $900 y $250/mes + 6%. Suma IA y apps a medida.\n\n` +
      `¿Qué vendes? Así te digo cuál te sirve de verdad.`,
  },
  {
    nombre: 'que hacen',
    prueba: /\b(que hacen|que hacts|a que se dedican|en que consiste|que ofrecen|servicios|que es)\b/,
    texto: () =>
      `Cuatro cosas: tiendas online que venden, WhatsApp que atiende y toma pedidos solo, ` +
      `agentes con inteligencia artificial y apps a medida.\n\n` +
      `Puedes ver casos reales aquí: ${config.web}`,
  },
  {
    nombre: 'web',
    prueba: /\b(web|pagina|sitio|link|enlace|catalogo)\b/,
    texto: () => `Aquí está todo, con los negocios que ya hicimos: ${config.web}`,
  },
  {
    nombre: 'humano',
    prueba: /\b(hablar con|una persona|humano|alguien|llamar|llamada|atiendeme)\b/,
    pasarAHumano: true,
    texto: () => `Claro. Ya le aviso a alguien del equipo y te escribe enseguida por aquí.`,
  },
];

const normaliza = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const cliente = config.apiKey ? new Anthropic({ apiKey: config.apiKey }) : null;

/**
 * Decide qué contestar.
 * Devuelve { texto, via: 'regla'|'ia'|'reserva', pasarAHumano: boolean }.
 */
export async function responder(mensaje, historial = []) {
  const limpio = normaliza(mensaje);

  for (const r of RESPUESTAS) {
    if (r.prueba.test(limpio)) {
      return { texto: r.texto(), via: `regla:${r.nombre}`, pasarAHumano: !!r.pasarAHumano };
    }
  }

  if (!cliente) {
    return {
      texto:
        `Déjame que te responda bien esto en un momento — te escribe alguien del equipo enseguida.\n\n` +
        `Mientras, aquí está todo lo que hacemos: ${config.web}`,
      via: 'reserva',
      pasarAHumano: true,
    };
  }

  try {
    const respuesta = await cliente.messages.create({
      model: config.modelo,
      max_tokens: 400,              // es WhatsApp: respuestas cortas a propósito
      output_config: { effort: 'low' },
      system: [
        { type: 'text', text: `${INSTRUCCIONES}\n\n---\n\n${NEGOCIO}`, cache_control: { type: 'ephemeral' } },
      ],
      messages: [...historial, { role: 'user', content: mensaje }],
    });

    if (respuesta.stop_reason === 'refusal') {
      return { texto: 'Prefiero que esto te lo conteste una persona. Te escriben enseguida.', via: 'ia:rechazo', pasarAHumano: true };
    }

    let texto = respuesta.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    const pasar = texto.includes('[PASAR A HUMANO]');
    texto = texto.replace(/\[PASAR A HUMANO\]/g, '').trim();

    if (!texto) {
      return { texto: 'Te responde una persona enseguida.', via: 'ia:vacia', pasarAHumano: true };
    }
    return { texto, via: 'ia', pasarAHumano: pasar };
  } catch (e) {
    // Si la IA falla, el bot no se cae: pasa la conversación y sigue vivo.
    let detalle = e.message;
    if (e instanceof Anthropic.AuthenticationError) detalle = 'clave de API inválida';
    else if (e instanceof Anthropic.RateLimitError) detalle = 'límite de peticiones alcanzado';
    else if (e instanceof Anthropic.APIConnectionError) detalle = 'no se pudo conectar con la API';
    else if (e instanceof Anthropic.APIError) detalle = `error ${e.status} de la API`;
    console.error('[cerebro]', detalle);

    return {
      texto: `Se me trabó la respuesta. Te escribe alguien del equipo enseguida.`,
      via: `error:${detalle}`,
      pasarAHumano: true,
    };
  }
}
