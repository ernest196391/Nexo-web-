import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const CARPETA = 'registro';

// Una línea JSON por evento. Sirve para revisar después qué preguntó la gente
// y qué respondió el bot, que es justo lo que hay que enseñarle a un cliente.
export async function anotar(evento) {
  const fila = { hora: new Date().toISOString(), ...evento };
  try {
    await mkdir(CARPETA, { recursive: true });
    const dia = fila.hora.slice(0, 10);
    await appendFile(join(CARPETA, `${dia}.jsonl`), JSON.stringify(fila) + '\n');
  } catch (e) {
    console.error('[registro] no se pudo escribir:', e.message);
  }
}
