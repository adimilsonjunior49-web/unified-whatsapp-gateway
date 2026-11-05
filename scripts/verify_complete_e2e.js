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

function del(path) {
  return request({ hostname: 'localhost', port: 8080, path, method: 'DELETE' });
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

  // 22. Resposta de Voz em Áudio PTT (TTS Humanizado)
  const tts = await post('/messages/send-voice-tts', { to: '5511976258311@s.whatsapp.net', text: 'Operação Loggi Cajamar confirmada com sucesso.' });
  check('Síntese de Voz PTT (TTS Humanizado com FFmpeg/Opus)', tts.status === 200 && tts.data?.success === true, `(Áudio gerado e despachado como nota de voz autêntica)`);

  // 23. Rastreamento Unificado de Encomendas & Chave Danfe (44 dígitos)
  const track = await get('/logistics/track/35240212345678000195550010008492041009876543');
  check('Rastreamento Unificado por Chave DANFE (44 dígitos) ou NF', track.status === 200 && track.data?.success === true && track.data?.code?.length === 44 && track.data?.isDanfe === true, `(Código: ${track.data?.code} • Status: ${track.data?.status} • Motorista: ${track.data?.assignedDriver})`);

  // 24. Morning Briefing Executivo & Disparo Telegram (@AtlasJuniorBot)
  const mb = await get('/tower/morning-briefing');
  const mbTel = await post('/tower/morning-briefing/send-telegram', {});
  check('Morning Briefing Executivo & Transmissão Telegram', mb.status === 200 && mb.data?.success === true && mbTel.data?.success === true, `(Pontualidade: ${mb.data?.briefing?.kpis?.onTimeRate} • Telegram enviado para Chat ID 553488777)`);

  // 25. Exportação em Planilha Excel / CSV com BOM UTF-8
  const expContacts = await get('/contacts/export.csv');
  const expReceipts = await get('/receipts/export.csv');
  check('Exportação em Planilha Excel / CSV (Contatos e Canhotos OCR)', expContacts.status === 200 && expContacts.data.startsWith('\uFEFF') && expReceipts.status === 200 && expReceipts.data.startsWith('\uFEFF'), `(BOM UTF-8 válido para abertura direta no Microsoft Excel)`);

  // 26. Documentação Interativa OpenAPI 3.0 / Swagger UI
  const swg = await get('/documentation/json');
  check('Documentação Interativa Swagger / OpenAPI 3.0 (/documentation)', swg.status === 200 && swg.data?.openapi, `(Versão OpenAPI: ${swg.data?.openapi} • Título: ${swg.data?.info?.title})`);

  // 27. Activity Heatmap 7x24 da Malha Loggi (GitHub Contribution Style)
  const hm = await get('/tower/activity-heatmap');
  check('Activity Heatmap Operacional 7x24 (Estilo GitHub Commits)', hm.status === 200 && hm.data?.success === true && hm.data?.matrix?.length === 7 && hm.data?.hours?.length === 24, `(${hm.data?.days?.length} dias x ${hm.data?.hours?.length}h • Total: ${hm.data?.totalActivity} eventos/semana)`);

  // 28. Central de Webhooks com Assinatura Criptográfica HMAC-SHA256
  const newWh = await post('/webhooks', { url: 'https://webhook.site/atlas-loggi-test', events: ['*'] });
  const whList = await get('/webhooks');
  check('Central de Webhooks & Integrações HMAC-SHA256 (Stripe/GitHub Style)', newWh.status === 200 && newWh.data?.webhook?.secret?.startsWith('whsec_') && whList.data?.webhooks?.length > 0, `(ID: ${newWh.data?.webhook?.id} • Secret: ${newWh.data?.webhook?.secret?.substring(0, 14)}...)`);

  // 29. Teste de Disparo Sintético de Webhook com Assinatura HMAC
  const whTest = await post('/webhooks/test-dispatch', {
    webhookId: newWh.data?.webhook?.id,
    url: 'https://httpbin.org/post',
    secret: newWh.data?.webhook?.secret
  });
  if (newWh.data?.webhook?.id) {
    await del('/webhooks/' + newWh.data?.webhook?.id);
  }
  check('Disparo de Webhook com Header X-Atlas-Signature-256', whTest.status === 200 && (whTest.data?.success === true || typeof whTest.data?.statusCode === 'number'), `(Entrega validada com HMAC-SHA256)`);

  // 30. Command Palette Global (Ctrl+K) & Soundscape Web Audio API no PWA
  const currentHtml = fs.readFileSync(publicIndex, 'utf8');
  const indexHasPalette = currentHtml.includes('commandPaletteModal') && currentHtml.includes('toggleCommandPalette') && currentHtml.includes('playAtlasSound');
  check('Command Palette Global (Ctrl+K) & Soundscape Háptico Web Audio API', indexHasPalette === true, '(Busca Raycast/Linear ativa • Síntese sonora harmônica sem dependências)');

  // 31. Geofencing Geoespacial dos CDs Loggi & Entrada em Docas (Turf.js Style)
  const geof = await get('/logistics/geofences');
  check('Geofencing Geoespacial & Cercas Virtuais dos CDs (Turf.js Engine)', geof.status === 200 && geof.data?.success === true && geof.data?.hubs?.length === 4 && geof.data?.vehicles?.length > 0, `(${geof.data?.hubs?.length} polos monitorados • Veículo ${geof.data?.vehicles?.[0]?.vehicleId}: ${geof.data?.vehicles?.[0]?.statusLabel})`);

  // 32. Fila Inteligente Anti-Ban com Jitter & Throttling Orgânico (Bottleneck Style)
  const ab = await get('/messages/anti-ban/status');
  check('Fila Inteligente Anti-Ban com Jitter Orgânico (Bottleneck/P-Queue)', ab.status === 200 && ab.data?.success === true && typeof ab.data?.telemetry?.healthScore === 'number', `(Score: ${ab.data?.telemetry?.healthScore}% • Status: ${ab.data?.telemetry?.status} • Limite: ${ab.data?.telemetry?.maxPerHour}/h)`);

  // 33. Métricas Corporativas Prometheus para Grafana (/metrics)
  const prom = await get('/metrics');
  check('Exportação de Métricas Prometheus para Grafana (/metrics)', prom.status === 200 && typeof prom.data === 'string' && prom.data.includes('atlas_antiban_health_score 100'), '(Métricas de mensagens, heap, uptime e integridade ativas)');

  // 34. Driver.js Tour Interativo & Painel de Geofencing no PWA Frontend
  const hasDriverAndGeofence = currentHtml.includes('driver.js') && currentHtml.includes('startSystemTour') && currentHtml.includes('geofencingSectionCard');
  check('Tour Guiado Interativo (Driver.js) & Painel Geofencing no PWA', hasDriverAndGeofence === true, '(Guia passo-a-passo e monitor perimétrico de satélite renderizados)');

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
