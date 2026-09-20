# Bot de WhatsApp de NEXO

Responde a quien escribe, contesta lo que ya sabemos del negocio y te avisa
cuando hace falta una persona. Corre en tu computadora, no en un servidor.

---

## Lee esto antes de arrancar

La API oficial de WhatsApp (Cloud API de Meta) **no está disponible para Cuba**:
ni los negocios cubanos pueden usarla, ni los usuarios de WhatsApp en Cuba
pueden recibir mensajes enviados por ella. Así que esto usa la vía no oficial
— Baileys, que habla el mismo protocolo que WhatsApp Web enlazando un número
real por QR.

Funciona, pero **va contra los términos de Meta y el número puede ser
bloqueado**. La detección es automática, a nivel de protocolo.

Lo que más dispara un bloqueo es **escribir a gente que no te escribió
primero**. Por eso este bot no puede hacerlo: no existe ninguna función de
envío masivo en el código, ni siquiera desactivada. Solo contesta.

**Lo ideal es usar un número aparte, no el que tienes en la web y en las
tarjetas.** Si aun así usas el principal, deja `LISTA_BLANCA` puesta.

---

## Arrancar

```bash
npm install
cp .env.example .env     # ábrelo y revísalo, sobre todo LISTA_BLANCA
npm start
```

Sale un QR en la terminal. En el teléfono del número que vas a usar:

**WhatsApp → Ajustes → Dispositivos vinculados → Vincular dispositivo → escanear**

Ya está. La sesión queda guardada en `auth/`, así que la próxima vez arranca
solo. Para desvincular: `npm run desvincular`.

### La prueba

Escríbele desde **otro** teléfono (uno que esté en `LISTA_BLANCA`). Prueba con:

- "hola"
- "¿cuánto cuesta?"
- "quiero hablar con alguien" → te llega el aviso a tu propio chat y el bot se calla

En la terminal ves entrar y salir cada mensaje. Todo queda en `registro/`,
un archivo por día: eso es lo que le enseñas a un cliente.

---

## Órdenes desde tu teléfono

Escríbelas tú, en cualquier chat. El bot las lee y las obedece:

| Orden | Qué hace |
|---|---|
| `/pausa` | Deja de responder a todo el mundo |
| `/sigue` | Vuelve a responder |
| `/mudo` | Se calla en ese chat concreto y hablas tú |
| `/estado` | Cuántos mensajes lleva esta hora, contactos, si la IA está activa |

---

## Lo que frena el riesgo de bloqueo

Todo esto está en `src/guardia.js` y se puede ajustar desde `.env`:

- **Solo responde a quien escribió primero.** Nunca inicia una conversación.
- **Lista blanca.** Mientras `LISTA_BLANCA` tenga números, ignora a todos los
  demás. Para una demo no necesitas más de dos o tres.
- **Espera al azar** de 2,5 a 6 segundos antes de contestar, con "escribiendo…".
  Responder en 80 ms no lo hace ninguna persona.
- **Topes por hora**, por contacto y en total. Al llegar al tope, se calla.
- **Al pasar a una persona se silencia** ese chat 30 minutos, para no hablar
  encima de ti.
- **No marca el número como "en línea"** (`markOnlineOnConnect: false`), así
  sigues usando WhatsApp con normalidad en el teléfono.

Aun con todo esto el riesgo no es cero. Es más bajo, no inexistente.

---

## Con IA y sin IA

Sin `ANTHROPIC_API_KEY` el bot funciona igual: responde saludos, precios, qué
hacemos y el enlace de la web con reglas fijas, y lo que no encaje te lo pasa a
ti. Es suficiente para una demo.

Con clave, entiende lo que le escriban con sus palabras ("tengo una cafetería y
no sé por dónde empezar") y contesta en el tono del negocio.

El modelo por defecto es `claude-opus-5`. Si quieres gastar menos, cambia
`CLAUDE_MODELO` en `.env` a `claude-haiku-4-5`: para contestar preguntas
frecuentes de WhatsApp va de sobra y cuesta bastante menos.

---

## Adaptarlo a un cliente

Casi todo está en dos sitios de `src/cerebro.js`:

- La constante `NEGOCIO` — qué vende, precios, enlaces.
- La lista `RESPUESTAS` — las preguntas frecuentes con su respuesta exacta.

Cambiando eso y el `.env` tienes el mismo bot para otro negocio, sin tocar el
resto del código.

---

## Comprobar que sigue bien

```bash
npm run probar
```

Comprueba las reglas de seguridad (solo responder, lista blanca, topes,
silencio, espera al azar) y las respuestas fijas. No toca WhatsApp ni gasta API.

---

## Cuando algo falla

| Qué ves | Qué pasa |
|---|---|
| El QR sale y se vuelve a dibujar | No te dio tiempo. Escanea más rápido; dura unos 20 s. |
| `La sesión se cerró desde el teléfono` | Lo desvinculaste desde el móvil. `npm run desvincular && npm start`. |
| `Conexión caída` y reconecta | Normal con internet inestable. Se recupera solo. |
| Responde pero muy raro | Sin clave de API. Está usando solo las reglas fijas. |
| No responde a nadie | Mira `LISTA_BLANCA` en `.env`, o manda `/estado` desde tu teléfono. |
