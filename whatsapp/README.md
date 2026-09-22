# WhatsApp de varios negocios, que aprende de ti

Un solo programa atiende el WhatsApp de todos tus negocios. Cada negocio tiene
su número, sus datos y su forma de hablar. Y cuando el bot no sabe algo, se
calla, respondes tú desde el teléfono, y **se lo queda aprendido**.

---

## Lo que tienes que saber antes de nada

**Ni Meta ni OpenAI dan servicio a Cuba.**

- La API oficial de WhatsApp (Cloud API) no está disponible para negocios en
  Cuba, y los usuarios de WhatsApp en Cuba tampoco pueden recibir mensajes
  enviados por ella. Por eso esto va por Baileys, enlazando un número real por
  QR. Funciona, pero va contra los términos de Meta y el número puede ser
  bloqueado.
- La API de OpenAI tampoco da servicio a Cuba, y usarla desde una IP cubana
  **puede hacer que te suspendan la cuenta**. Lo mismo vale para Anthropic.

Por eso este bot **no depende de ninguna IA para funcionar**. La IA es un
añadido opcional. Lo que de verdad lo hace inteligente es lo que aprende de ti,
y eso corre entero en tu computadora, sin internet y sin cuenta en ningún sitio.

Si consigues acceso legítimo a una API (una entidad fuera de Cuba, un socio, o
un modelo corriendo en tu propia máquina), se conecta cambiando dos líneas del
`.env`. Pero el sistema está pensado para que no haga falta.

---

## Cómo aprende

```
  Cliente: "¿cuánto cuesta llevar un paquete a Playa?"
     ↓
  El bot no sabe → se calla y te avisa a tu propio WhatsApp
     ↓
  Tú respondes desde el teléfono: "A Playa son 500 CUP, llega el mismo día"
     ↓
  El bot ve tu respuesta, la empareja con la pregunta y se la guarda
     ↓
  Otro cliente: "cuanto vale mandar algo para playa?"
     ↓
  El bot responde solo, con TUS palabras
```

Cada vez que atiendes a alguien, el bot mejora. No hace falta entrenarlo ni
escribir reglas: haz tu trabajo y él va copiando.

**Cuando te corriges, manda tu última versión.** Si mañana el precio sube y
respondes "ahora son 600", sustituye a la respuesta vieja en vez de convivir
con ella.

**No responde si no está seguro.** Reconoce "cuánto vale mandar algo para
Playa" como la misma pregunta que "cuánto cuesta llevar un paquete a Playa",
pero **no** contesta el precio de Playa a quien preguntó por Santiago. Prefiere
callarse antes que inventar. Ese umbral está medido, no puesto a ojo: corre
`npm run probar` y lo ves.

---

## Arrancar

```bash
npm install
cp .env.example .env         # revisa LISTA_BLANCA
```

Da de alta tu primer negocio:

```bash
npm run gestionar añadir "NEXO" 5354056173 \
  "Automatización, IA y software para negocios" \
  "Directo y cálido, de tú" \
  "https://nexo-plan-veci.vercel.app"
```

Ponle lo que tiene que saber:

```bash
npm run gestionar dato NEXO "plan Starter" "\$250 de instalación, \$125/mes + 10%"
npm run gestionar dato NEXO "horario" "Lunes a sábado, 9am a 6pm"
```

Arranca:

```bash
npm start
```

Sale un QR por cada negocio. Escanea cada uno **desde el teléfono de ese
número**: Ajustes → Dispositivos vinculados → Vincular dispositivo.

Para añadir otro negocio: otro `añadir`, reinicias, y escaneas su QR. No se
toca ni una línea de código.

---

## El día a día

```bash
npm run negocios                      # qué hay dado de alta y cuánto sabe cada uno
npm run gestionar revisar NEXO        # lo que te ha aprendido y está sin revisar
npm run gestionar aprobar 14          # "esta está bien" → la usa con más confianza
npm run gestionar descartar 15        # "esta no" → no la vuelve a usar
npm run gestionar sabidos NEXO        # lo aprobado, lo más usado primero
npm run gestionar                     # todas las órdenes
```

Revisar no es obligatorio: sin revisar también las usa, pero solo cuando la
pregunta es casi idéntica. Aprobarlas le da más margen.

### Desde tu teléfono

En cualquier chat, escribe tú:

| Orden | Qué hace |
|---|---|
| `/pausa` | Todos los bots dejan de responder |
| `/sigue` | Vuelven |
| `/mudo` | Se calla en ese chat concreto |
| `/estado` | Negocios conectados, mensajes esta hora, si hay IA |

Y no hace falta ninguna orden para tomar el control: **en cuanto escribes en un
chat, el bot se aparta 30 minutos**.

---

## Lo que frena el riesgo de bloqueo

- **Nunca inicia una conversación.** Solo responde a quien escribió primero. No
  existe función de envío masivo en el código, ni siquiera desactivada.
- **Lista blanca**: mientras `LISTA_BLANCA` tenga números, ignora al resto.
- **Espera de 2,5 a 6 segundos al azar**, con "escribiendo…".
- **Topes por hora**, por contacto y en total.
- **Se calla cuando entras tú** en un chat.
- **No marca el número como "en línea"**, así usas el teléfono con normalidad.

El riesgo baja; no desaparece. Lo suyo es un número por negocio, y no el que
tienes impreso en las tarjetas.

---

## Conectar una IA (opcional)

Habla el formato de OpenAI, así que vale OpenAI, OpenRouter, LM Studio,
llama.cpp… cualquiera que exponga `/chat/completions`.

```bash
# en .env
IA_BASE_URL=https://api.openai.com/v1
IA_CLAVE=tu-clave
```

Luego, para saber qué modelo poner:

```bash
npm run modelos     # pregunta a tu proveedor qué admite tu clave
```

y pones uno en `IA_MODELO`. No hay modelo por defecto a propósito: los nombres
cambian cada pocos meses y es mejor preguntar que adivinar.

Con IA conectada, el bot le pasa **tus respuestas parecidas como ejemplo**, así
que no habla como un robot genérico: copia tu forma. Sin IA, sigue funcionando
con lo aprendido.

---

## Qué hay dentro

| Archivo | Para qué |
|---|---|
| `src/db.js` | La base de datos. Un archivo SQLite, sin servidor. Viene dentro de Node. |
| `src/aprendizaje.js` | Captura tus respuestas y las vuelve a encontrar |
| `src/sinonimos.js` | Que "mandar", "llevar" y "enviar" cuenten como lo mismo |
| `src/umbrales.js` | Cuánto se tiene que parecer una pregunta. Con el porqué de cada número. |
| `src/cerebro.js` | Decide: ¿lo sé por ti? ¿lo pregunto a la IA? ¿o te aviso? |
| `src/guardia.js` | Todo lo que frena el riesgo de bloqueo |
| `src/proveedor.js` | El puente con la IA, si la hay |
| `src/gestionar.js` | Las órdenes de la terminal |
| `src/index.js` | Las sesiones de WhatsApp, una por negocio |

Todo en `datos/nexo.db`. Cópialo y tienes una copia de seguridad de todo lo que
el bot sabe.

### Afinar el diccionario

`src/sinonimos.js` es lo que más rinde por minuto invertido. Si tus clientes
dicen "bulto" y tú dices "paquete", añádelo al grupo. Después corre
`npm run probar`: te avisa si un cambio hizo que empiece a confundir preguntas
que en realidad son distintas.

---

## Comprobar que sigue bien

```bash
npm run probar
```

Cuatro tandas: las reglas de seguridad, el diccionario de sinónimos, la memoria
de lo aprendido y el ciclo completo (llega un cliente → no sabe → respondes tú
→ ya sabe). No toca WhatsApp ni gasta API.
