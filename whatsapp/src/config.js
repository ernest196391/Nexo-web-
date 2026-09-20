import 'dotenv/config';

const numeros = (v) =>
  (v || '').split(',').map((s) => s.replace(/\D/g, '')).filter(Boolean);

const entero = (v, porDefecto) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : porDefecto;
};

export const config = {
  negocio: process.env.NEGOCIO || 'NEXO',
  web: process.env.WEB || 'https://nexo-plan-veci.vercel.app',

  // Vacía = responde a cualquiera. Con números = solo a esos.
  listaBlanca: numeros(process.env.LISTA_BLANCA),

  esperaMinMs: entero(process.env.ESPERA_MIN_MS, 2500),
  esperaMaxMs: entero(process.env.ESPERA_MAX_MS, 6000),
  topeContactoHora: entero(process.env.TOPE_CONTACTO_HORA, 12),
  topeGlobalHora: entero(process.env.TOPE_GLOBAL_HORA, 60),
  silencioMin: entero(process.env.SILENCIO_MIN, 30),

  apiKey: process.env.ANTHROPIC_API_KEY || '',
  modelo: process.env.CLAUDE_MODELO || 'claude-opus-5',
};

export function avisos() {
  const out = [];
  if (!config.listaBlanca.length) {
    out.push('LISTA_BLANCA está vacía: el bot responderá a CUALQUIER número que escriba.');
  }
  if (!config.apiKey) out.push('Sin ANTHROPIC_API_KEY: solo responderán las reglas fijas, lo demás pasa a una persona.');
  return out;
}
