const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navegando para http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

  // Aguarda 3 segundos para renderização dos dados e lucide icons
  await page.waitForTimeout(3000);

  const outputPath = path.resolve('C:/Users/Home/.gemini/antigravity/brain/fb09acf8-3479-4785-b00d-f17c24893309/tela_whatsapp_corrigida.png');
  await page.screenshot({ path: outputPath, fullPage: false });
  console.log('Screenshot salva com sucesso em:', outputPath);

  // Inspeciona o que está na tela
  const chatListCount = await page.locator('#chatListContainer > div').count();
  const activeChatTitle = await page.locator('#activeChatTitle').innerText().catch(() => 'Nenhum');
  const weatherText = await page.locator('#headerWeatherBadge').innerText().catch(() => 'Nenhum');

  console.log('STATUS DA TELA:');
  console.log('- Total de itens renderizados no chat list:', chatListCount);
  console.log('- Conversa ativa no centro:', activeChatTitle);
  console.log('- Badge do clima no topo:', weatherText);

  await browser.close();
}

main().catch(err => {
  console.error('Erro na captura:', err);
  process.exit(1);
});
