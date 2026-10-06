# Marca de NEXO — dónde está

**La fuente de verdad es el sistema de diseño «NEXO», manual 1.0.**
https://claude.ai/artifact/EfGpYstNPNyoXSQAZEEMXC

Lo que hay en este repositorio es una copia de trabajo, no el original:

| Aquí | Qué es |
|---|---|
| `marca/sistema/project/README.md` | El manual completo, tal cual |
| `marca/sistema/project/tokens.json` | Los tokens, tal cual |
| `marca/sistema/project/fonts/` | Las cinco Archivo |
| `marca/sistema/assets/` | Los logos e iconos que usa la web |
| `css/nexo.css` | **Generado** desde tokens.json con `marca/generar-css.py` |
| `assets/marca/`, `assets/fuentes-archivo/` | Lo que sirve la web |

Si el manual cambia, se vuelve a bajar y se regenera el CSS. **No se edita
`css/nexo.css` a mano**, ni se escribe un color en hex en ningún componente.

## Lo que más se incumple

Del manual §8 y §12, porque es lo que se cuela solo:

- **Prohibido escribir "IA" o "inteligencia artificial".** También "algoritmo",
  "sincronizar", "servidor", "plataforma", "ecosistema", "innovador" y
  "disruptivo". Y las palabras de España: "móvil", "vale", "ordenador".
- **Una idea por frase, 12 palabras como máximo.**
- **Un solo botón `brand` por pantalla.** El amarillo marca la acción más
  importante y nada más.
- **El amarillo nunca va como texto, línea fina ni icono sobre fondo claro**:
  da 1,6:1.
- **Ningún texto de lectura baja de 16 px.**
- **Prohibidas las fuentes Inter, Roboto y Arial.**
- Nada de dashboards falsos, cifras inventadas ni fotos de banco.

```bash
python3 marca/comprobar-manual.py
```

Comprueba lo que se puede comprobar solo: palabras prohibidas, botones brand
por página, hex sueltos, fuentes prohibidas, tamaños mínimos y frases de más de
12 palabras. No sustituye a mirar la página.

## Lo que falta

**Una foto real de un comercio** para el héroe de la portada. El manual (§7)
pide comercios cubanos reales, con luz natural de puerta o ventana, encuadre a
la altura del mostrador y gente trabajando con permiso firmado. Prohíbe
expresamente las fotos de banco y las imágenes generadas que imiten comercios
reales. Mientras no exista, el bloque amarillo con el símbolo ocupa ese sitio.
