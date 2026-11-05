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
