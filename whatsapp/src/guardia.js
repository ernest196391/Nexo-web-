// Todo lo que frena el riesgo de que WhatsApp bloquee el número vive aquí.
//
// La regla de fondo: el bot NUNCA inicia una conversación. Solo contesta a
// quien escribió primero, y con cuentagotas. Enviar mensajes a gente que no te
// escribió es lo que dispara los bloqueos, así que esa capacidad ni existe en
// este código: no hay función de envío masivo que alguien pueda usar por error.

const HORA_MS = 60 * 60 * 1000;

export function crearGuardia(config) {
  const porContacto = new Map();  // jid -> [marcas de tiempo]
  const global = [];              // marcas de tiempo de todo lo enviado
  const conocidos = new Set();    // jid que nos han escrito en esta sesión

  const podar = (arr, desde) => {
    while (arr.length && arr[0] < desde) arr.shift();
    return arr;
  };

  return {
    // Se llama con cada mensaje entrante, antes de decidir nada.
    marcarEntrante(jid) {
      conocidos.add(jid);
    },

    /**
     * ¿Se puede responder a este contacto ahora mismo?
     * Devuelve { ok: true } o { ok: false, motivo: '...' }.
     */
    permite(jid, numero) {
      const ahora = Date.now();

      if (!conocidos.has(jid)) {
        return { ok: false, motivo: 'no escribió primero' };
      }

      if (config.listaBlanca.length && !config.listaBlanca.includes(numero)) {
        return { ok: false, motivo: 'fuera de la lista blanca' };
      }

      const mios = podar(porContacto.get(jid) || [], ahora - HORA_MS);
      if (mios.length >= config.topeContactoHora) {
        return { ok: false, motivo: `tope del contacto (${config.topeContactoHora}/hora)` };
      }

      if (podar(global, ahora - HORA_MS).length >= config.topeGlobalHora) {
        return { ok: false, motivo: `tope global (${config.topeGlobalHora}/hora)` };
      }

      return { ok: true };
    },

    // Se llama justo después de enviar, para que los topes cuenten de verdad.
    anotaEnvio(jid) {
      const ahora = Date.now();
      const mios = porContacto.get(jid) || [];
      mios.push(ahora);
      porContacto.set(jid, mios);
      global.push(ahora);
    },

    // Espera al azar: contestar en 80 ms no lo hace ninguna persona.
    esperaHumana() {
      const { esperaMinMs: min, esperaMaxMs: max } = config;
      return min + Math.floor(Math.random() * Math.max(1, max - min));
    },

    estado() {
      const desde = Date.now() - HORA_MS;
      return {
        enviadosUltimaHora: podar(global, desde).length,
        topeGlobalHora: config.topeGlobalHora,
        contactos: conocidos.size,
      };
    },
  };
}
