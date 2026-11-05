const http = require('http');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

function request(options, data) {
  return new Promise((resolve, reject) => {
    if (!options.headers) options.headers = {};
    options.headers['x-api-key'] = 'sua_chave_mestra_secreta_aqui';
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

function get(path) {
  return request({ hostname: 'localhost', port: 8080, path, method: 'GET' });
}

function post(path, body) {
  return request({
    hostname: 'localhost',
    port: 8080,
    path,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, body);
}

let passed = 0;
let total = 0;

function check(title, condition, extra = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ [ETAPA ${total}] PASS: ${title} ${extra}`);
  } else {
    console.error(`❌ [ETAPA ${total}] FAIL: ${title} ${extra}`);
  }
}

async function runFullE2ETest() {
  console.log('================================================================');
  console.log('🚀 SUÍTE DE HOMOLOGAÇÃO TOTAL E2E - SISTEMA ATLAS LOGGI');
  console.log('================================================================\n');

  // 1. Health
  const h = await get('/health');
  check('Servidor Fastify Ativo & Saudável', h.status === 200 && h.data?.status === 'UP', `(Uptime: ${Math.floor(h.data?.uptime || 0)}s)`);

  // 2. WhatsApp Master Conectado
  const s = await get('/sessions');
  const master = s.data?.data?.[0];
  check('Conexão WhatsApp Master', master?.status === 'CONNECTED', `(Número: ${master?.phoneNumber})`);

  // 3. SQLite Storage Persistence
  const db = new DatabaseSync(path.join(__dirname, '..', 'storage', 'atlas_enterprise.db'));
  const chatsCount = db.prepare('SELECT count(*) as c FROM chats').get()?.c || 0;
  const contactsCount = db.prepare('SELECT count(*) as c FROM contacts').get()?.c || 0;
  const receiptsCount = db.prepare('SELECT count(*) as c FROM delivery_receipts').get()?.c || 0;
  const callsCount = db.prepare('SELECT count(*) as c FROM call_logs').get()?.c || 0;
  const fleetCount = db.prepare('SELECT count(*) as c FROM fleet_locations').get()?.c || 0;

  check('Persistência Relacional SQLite WAL', chatsCount > 0, `(${chatsCount} chats, ${contactsCount} contatos)`);
  check('Sincronização dos Grupos Loggi', chatsCount >= 40, `(${chatsCount} grupos monitorados)`);
  check('Agenda Completa de Contatos Salvos', contactsCount >= 100, `(${contactsCount} contatos indexados)`);

  // 4. Smart Replies Humanizados
  const sr = await post('/chats/whatsapp_principal/smart-replies', { text: 'A carga de Campinas já foi recebida?', name: 'Supervisor' });
  check('Sugestões Humanizadas de Resposta (Smart Replies)', Array.isArray(sr.data?.data) && sr.data.data.length === 3, '(Tons: Ciente, Resolutivo, Cordial)');

  // 5. Torre de Controle & Métricas
  const tw = await get('/tower/metrics');
  check('Faróis Operacionais da Torre de Controle', tw.data?.beacons?.global?.code === 'GREEN', `(Farol Geral: ${tw.data?.beacons?.global?.label})`);
  check('Painéis dos Polos Regionais Loggi', tw.data?.hubs?.length === 4, `(Cajamar, Leopoldina, Campinas, Pavuna)`);

  // 6. Rastreamento Frota Leaflet
  const fl = await get('/logistics/fleet-live');
  check('Mapa da Frota & Telemetria em Tempo Real', fl.data?.hubs?.length === 4 && fl.data?.vehicles?.length > 0, `(${fl.data?.vehicles?.length} veículos em trânsito)`);

  // 7. Canhotos & OCR de Notas Fiscais
  const rc = await get('/logistics/receipts');
  check('Leitura e Indexação de Canhotos com OCR', rc.status === 200 && rc.data?.receipts?.length > 0, `(${rc.data?.receipts?.length} canhotos baixados)`);

  // 8. Teste Ativo de OCR (Simulação de Baixa de Entrega)
  const ocrTest = await post('/logistics/ocr-demo', { driverName: 'Carlos - Rota D+0', nfNumber: '554321' });
  check('Processamento de Baixa de Canhoto e Notificação Telegram', ocrTest.data?.success === true, `(NF: ${ocrTest.data?.nfNumber})`);

  // 9. Telefonia & Softphone WebRTC
  const callTest = await post('/telephony/call', { phone: '11976258311', contactName: 'Adimilson Júnior' });
  check('Telefonia WebRTC / Discador Executivo', callTest.data?.success === true && callTest.data?.status === 'CONNECTED', `(Call ID: ${callTest.data?.callId})`);

  // 10. Agente Despachante Loggi (RAG de Procedimentos)
  const dispTest = await post('/agent/dispatcher/ask', { question: 'Como proceder com cliente ausente?' });
  check('Agente Despachante Autônomo da Loggi (RAG)', dispTest.data?.answered === true, `(Tópico: ${dispTest.data?.topic})`);

  // 11. Teste de IA Autônoma com FreeLLMAPI e Ollama
  const { agencyHub } = require('../dist/infrastructure/agents/agencyHub');
  const aiReply = await agencyHub.generateResponse({
    id: 'test_msg',
    remoteJid: 'test@s.whatsapp.net',
    senderJid: 'test@s.whatsapp.net',
    text: 'Olá, qual o horário de corte?',
    timestamp: Math.floor(Date.now() / 1000),
    isFromMe: false
  });
  check('Agente de IA Integrado (Multi-Model Failover)', typeof aiReply === 'string' && aiReply.length > 0, `(Resposta gerada: ${aiReply.substring(0, 45)}...)`);

  // 12. Relatório Executivo Timbrado em PDF / HTML
  const rep = await get('/tower/report-html');
  check('Emissão de Relatório Executivo Timbrado', rep.status === 200 && typeof rep.data === 'string' && rep.data.includes('LOGGI OPERAÇÕES'), '(Formato pronto para impressão e PDF)');

  // 13. Atalho Único na Área de Trabalho
  const desktopShortcut = 'C:\\Users\\Home\\Desktop\\WhatsApp.lnk';
  check('Atalho Executivo Exclusivo na Área de Trabalho', fs.existsSync(desktopShortcut), `(${desktopShortcut})`);

  // 14. Backup Atômico do SQLite
  const bk = await post('/backup/create', {});
  const bList = await get('/backup/list');
  check('Backup Atômico & Compactação do SQLite', bk.data?.success === true && bList.data?.backups?.length > 0, `(${bk.data?.backup?.filename} • ${bk.data?.backup?.sizeFormatted})`);

  // 15. Watchdog & Inicialização Silenciosa com o Windows
  const startupVbs = 'C:\\Users\\Home\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\StartAtlasLoggiGateway.vbs';
  check('Watchdog & Inicialização Automática com o Windows', fs.existsSync(startupVbs), `(${startupVbs})`);

  // 16. Previsão do Tempo Dinâmica & Temas Adaptativos
  const w = await get('/api/weather');
  check('Previsão do Tempo Dinâmica & Adaptação de Temas (Open-Meteo)', w.status === 200 && w.data?.success === true && typeof w.data?.temperature === 'number', `(${w.data?.temperature}°C • ${w.data?.conditionLabel} • Tema: ${w.data?.recommendedTheme})`);

  // 17. Radar News & Inteligência de Mercado e IA
  const nw = await get('/api/news');
  check('Radar News & Mercado de Atuação & IA', nw.status === 200 && nw.data?.articles?.length >= 5, `(${nw.data?.articles?.length} artigos com análise de impacto Loggi)`);

  // 18. Feed Consolidado de Grupos & Menções VIP
  const gf = await get('/groups/consolidated-messages?mentionedOnly=false');
  const gfVip = await get('/groups/consolidated-messages?mentionedOnly=true');
  check('Feed Consolidado de Grupos & Menções VIP (@Adimilson)', gf.status === 200 && gf.data?.messages?.length > 0 && gfVip.status === 200, `(${gf.data?.messages?.length} msgs nos grupos, ${gf.data?.totalMentions} menções VIP)`);

  // 19. Painel Analítico & Gráficos Horários de Carga
  const an = await get('/tower/analytics-charts');
  check('Painéis Analíticos & Telemetria por Hora', an.status === 200 && an.data?.hourlyThroughput?.length > 0, `(${an.data?.hourlyThroughput?.length} faixas horárias, ${an.data?.hubsDistribution?.length} polos monitorados)`);

  // 20. Validação de Resposta Automática Humanizada EXCLUSIVA para contato Loggi
  const { highCapacityStore } = require('../dist/infrastructure/storage/highCapacityStore');
  const isLoggiAllowed = highCapacityStore.isLoggiContact('1203630291823719@g.us', 'Grupo Loggi Cajamar', 'Carreta doca 04');
  const isPessoalBlocked = highCapacityStore.isLoggiContact('5511999998888@s.whatsapp.net', 'Tia Maria', 'Oi sumido, vai no almoço?');
  check('Filtro de Resposta de IA Exclusivo Loggi (Silêncio Pessoal)', isLoggiAllowed === true && isPessoalBlocked === false, '(Permitido para Loggi: SIM • Silêncio em Pessoal: SIM)');

  // 21. Topbar Adaptativo e Interface PWA (public/index.html)
  const publicIndex = path.join(__dirname, '..', 'public', 'index.html');
  const indexHtml = fs.readFileSync(publicIndex, 'utf8');
  check('Interface Adaptativa (Relógio, Clima, Feed Grupos, News & PWA)', fs.existsSync(publicIndex) && indexHtml.includes('theme-night-rain') && indexHtml.includes('viewSectionGroupfeed') && indexHtml.includes('viewSectionNews'), `(Tamanho: ${Math.round(indexHtml.length / 1024)} KB)`);

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL: ${passed}/${total} ETAPAS APROVADAS (${Math.round((passed/total)*100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 100% DAS FUNÇÕES, MÓDULOS E O AGENTE ESTÃO HOMOLOGADOS E OPERACIONAIS!');
  } else {
    process.exit(1);
  }
}

runFullE2ETest().catch(e => {
  console.error('Erro na execução da suíte:', e);
  process.exit(1);
});
