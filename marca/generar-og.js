const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const sim = fs.readFileSync('assets/marca/nexo-simbolo-tinta.svg', 'utf8');
  const logo = fs.readFileSync('assets/marca/nexo-horizontal-tinta.svg', 'utf8');
  const f = (w) => fs.readFileSync(`assets/fuentes-archivo/Archivo-${w}.woff2`).toString('base64');
  // Tinta sobre amarillo: una de las cinco combinaciones que permite el manual.
  // Margen de 64 px, como el de las piezas de Instagram.
  await p.setContent(`<html><head><style>
    @font-face{font-family:Archivo;src:url(data:font/woff2;base64,${f(800)}) format('woff2');font-weight:800}
    @font-face{font-family:Archivo;src:url(data:font/woff2;base64,${f(400)}) format('woff2');font-weight:400}
    *{margin:0;box-sizing:border-box}
    body{width:1200px;height:630px;background:#FFC21A;font-family:Archivo,sans-serif;color:#121212;
         position:relative;overflow:hidden;padding:64px;display:flex;flex-direction:column;justify-content:space-between}
    .sim{position:absolute;right:-110px;bottom:-150px;width:620px;opacity:1}
    .sim svg{width:100%;height:auto}
    h1{font-size:62px;line-height:66px;font-weight:800;letter-spacing:-.02em;max-width:15ch;position:relative}
    .pie{display:flex;align-items:flex-end;justify-content:space-between;position:relative}
    .pie .l svg{height:34px;width:auto}
    p{font-size:22px;line-height:30px;font-weight:400;max-width:30ch}
  </style></head><body>
    <div class="sim">${sim}</div>
    <h1>Del producto al cliente, todo conectado.</h1>
    <div class="pie">
      <div class="l">${logo}</div>
    </div>
  </body></html>`);
  await p.waitForTimeout(400);
  await p.screenshot({ path: 'assets/marca/og-nexo.png' });
  await b.close();
  console.log('og-nexo.png');
})();
