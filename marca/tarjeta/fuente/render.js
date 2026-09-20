const { chromium } = require('playwright');
const MM = 96 / 25.4;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  // --- Comprobacion: nada de texto ni el QR fuera del margen de seguridad ---
  const v = await b.newPage({ viewport: { width: 420, height: 760 } });
  await v.goto('http://127.0.0.1:8766/tarjeta.html?v=' + Date.now() + '', { waitUntil: 'networkidle' });
  const informe = await v.evaluate((MM) => {
    const SEGURO = 7, ANCHO = 91, ALTO = 61;
    const out = [];
    document.querySelectorAll('.cara').forEach((cara, i) => {
      const c = cara.getBoundingClientRect();
      const lim = { x1: SEGURO * MM, y1: SEGURO * MM, x2: (ANCHO - SEGURO) * MM, y2: (ALTO - SEGURO) * MM };
      const sel = '.logo,.filete,.lema,.marca,.nombre,.cargo,.regla,.hace li,.contacto,.qr-caja,.pie-qr';
      cara.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect();
        const caja = [r.left - c.left, r.top - c.top, r.right - c.left, r.bottom - c.top];
        if (caja[0] < lim.x1 - .5 || caja[1] < lim.y1 - .5 || caja[2] > lim.x2 + .5 || caja[3] > lim.y2 + .5)
          out.push({ cara: i ? 'dorso' : 'frente', el: String(el.className).slice(0, 18),
                     texto: (el.textContent || '').trim().slice(0, 26),
                     mm: caja.map(n => +(n / MM).toFixed(1)) });
      });
      const d = cara.querySelector('.datos');
      if (d) out.push({ nota: 'alto columna datos', mm: +(d.scrollHeight / MM).toFixed(2), cabe_en: ALTO - 2 * SEGURO });
      cara.querySelectorAll('.hace li').forEach(li => {
        if (li.scrollWidth > li.clientWidth + 1)
          out.push({ se_parte: li.textContent.trim(), sobra_mm: +((li.scrollWidth - li.clientWidth) / MM).toFixed(1) });
      });
    });
    return out;
  }, MM);
  console.log('--- geometria ---');
  informe.forEach(r => console.log(JSON.stringify(r)));
  await v.close();

  // --- PDF vectorial, 2 paginas de 91x61 mm (85x55 de corte + 3 mm de sangrado) ---
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:8766/tarjeta.html?v=' + Date.now() + '', { waitUntil: 'networkidle' });
  await p.pdf({ path: 'tarjeta-nexo-imprenta.pdf', width: '91mm', height: '61mm',
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
                printBackground: true, preferCSSPageSize: true });
  await b.close();
  console.log('--- PDF generado ---');
})();
