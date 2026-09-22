// Cuánto se tiene que parecer una pregunta nueva a una que ya respondiste.
// Los números no son inventados: salen de medir pares reales de preguntas
// iguales contra pares que solo se parecen (corre `npm run probar`).
//
// 0.70 es el punto donde reconoce 4 de cada 6 formas distintas de preguntar lo
// mismo sin confundir NINGUNA pregunta que en realidad es otra. Bajarlo hace
// que empiece a responder el precio de Playa a quien preguntó por Vedado, que
// es mucho peor que quedarse callado.

export const UMBRAL_DIRECTO = 0.70;   // responde con tu respuesta tal cual (ejemplo ya revisado)
export const UMBRAL_SIN_REVISAR = 0.85; // lo mismo, pero si aún no lo revisaste: más exigente
export const UMBRAL_EJEMPLO = 0.35;   // lo pasa a la IA como ejemplo de cómo hablas tú
