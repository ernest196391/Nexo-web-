// Adaptador de IA. Habla el formato de OpenAI (/chat/completions), que es el
// que entienden también OpenRouter, LM Studio, llama.cpp y casi cualquier otro.
// Así, si mañana cambias de sitio, cambias una URL en .env y nada más.
//
// Va con fetch pelado a propósito: una dependencia menos que descargar, y
// ninguna librería que se case con un solo proveedor.

const BASE = (process.env.IA_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const CLAVE = process.env.IA_CLAVE || '';
const MODELO = process.env.IA_MODELO || '';
const ESPERA_MS = Number(process.env.IA_ESPERA_MS || 20000);

export const hayIA = () => Boolean(CLAVE && MODELO);

export function porQueNoHayIA() {
  if (!CLAVE) return 'falta IA_CLAVE en .env';
  if (!MODELO) return 'falta IA_MODELO en .env (corre `npm run modelos` para ver cuáles tienes)';
  return '';
}

async function llamar(ruta, opciones = {}) {
  const corte = AbortSignal.timeout(ESPERA_MS);
  const r = await fetch(`${BASE}${ruta}`, {
    ...opciones,
    signal: corte,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${CLAVE}`,
      ...(opciones.headers || {}),
    },
  });
  const cuerpo = await r.text();
  if (!r.ok) {
    let detalle = cuerpo.slice(0, 300);
    try { detalle = JSON.parse(cuerpo).error?.message || detalle; } catch {}
    const e = new Error(detalle);
    e.status = r.status;
    throw e;
  }
  return JSON.parse(cuerpo);
}

export async function listarModelos() {
  const r = await llamar('/models');
  return (r.data || []).map((m) => m.id).sort();
}

/**
 * Manda la conversación y devuelve el texto. Lanza si algo falla: quien llama
 * decide qué hacer (en este bot, pasarle la conversación a una persona).
 */
export async function preguntar({ sistema, conversacion, limite = 400 }) {
  const cuerpo = {
    model: MODELO,
    messages: [{ role: 'system', content: sistema }, ...conversacion],
    max_completion_tokens: limite,
  };

  let r;
  try {
    r = await llamar('/chat/completions', { method: 'POST', body: JSON.stringify(cuerpo) });
  } catch (e) {
    // Los modelos viejos quieren max_tokens; los nuevos, max_completion_tokens.
    // En vez de adivinar cuál usa tu cuenta, se prueba y se corrige.
    if (e.status === 400 && /max_completion_tokens|max_tokens/i.test(e.message)) {
      const { max_completion_tokens, ...resto } = cuerpo;
      r = await llamar('/chat/completions', {
        method: 'POST',
        body: JSON.stringify({ ...resto, max_tokens: max_completion_tokens }),
      });
    } else {
      throw e;
    }
  }

  const texto = (r.choices?.[0]?.message?.content || '').trim();
  if (!texto) throw new Error('la IA devolvió una respuesta vacía');
  return texto;
}

export const descripcion = () => (hayIA() ? `${MODELO} en ${BASE}` : `sin IA (${porQueNoHayIA()})`);
