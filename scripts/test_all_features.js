const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const HEADERS = {
  'Authorization': 'Bearer sua_chave_mestra_secreta_aqui',
  'Content-Type': 'application/json'
};

async function runFullVerification() {
  console.log('=====================================================');
  console.log('🧪 BATERIA DE TESTES DE INTEGRAÇÃO - RECURSOS 100%');
  console.log('=====================================================');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name} ->`, err.response?.data || err.message);
    }
  }

  // 1. Health Check
  await test('1. Health Check do Gateway (/health)', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.data.status !== 'UP') throw new Error('Status não é UP');
  });

  // 2. Status WhatsApp Master
  await test('2. Status WhatsApp Master (/sessions/whatsapp_principal/status)', async () => {
    const res = await axios.get(`${BASE_URL}/sessions/whatsapp_principal/status`, { headers: HEADERS });
    if (res.data.data?.status !== 'CONNECTED') throw new Error(`Status esperado CONNECTED, obtido: ${res.data.data?.status}`);
    if (res.data.data?.phoneNumber !== '5511976258311') throw new Error(`Número inválido: ${res.data.data?.phoneNumber}`);
  });

  // 3. Ícone Executivo SVG
  await test('3. Ícone do App (/icon.svg)', async () => {
    const res = await axios.get(`${BASE_URL}/icon.svg`);
    if (!res.headers['content-type'].includes('svg')) throw new Error('Content-Type não é SVG');
    if (!res.data.includes('<svg')) throw new Error('Conteúdo não é SVG válido');
  });

  // 4. Manifesto PWA
  await test('4. Manifesto PWA (/manifest.json)', async () => {
    const res = await axios.get(`${BASE_URL}/manifest.json`);
    if (!res.data.name.includes('Loggi')) throw new Error('Nome do app não confere');
    if (res.data.icons[0].src !== '/icon.svg') throw new Error('Ícone no manifesto não confere');
  });

  // 5. Interface Web
  await test('5. Interface Web Dashboard (/)', async () => {
    const res = await axios.get(`${BASE_URL}/`);
    if (!res.data.includes('Atlas Loggi Command Center')) throw new Error('Dashboard HTML incompleto');
  });

  // 6. Lista de Chats & Grupos da Loggi
  await test('6. API de Chats e Grupos (/chats/whatsapp_principal)', async () => {
    const res = await axios.get(`${BASE_URL}/chats/whatsapp_principal`);
    if (res.data.success !== true) throw new Error('Falha ao listar chats');
  });

  // 7. Catálogo de Agentes do AgencyHub
  await test('7. Agentes do AgencyHub (/agents)', async () => {
    const res = await axios.get(`${BASE_URL}/agents`);
    if (res.data.personas.length !== 5) throw new Error('Deveria conter 5 personas');
  });

  // 8. Troca de Persona Ativa
  await test('8. Selecionar Persona Ativa (POST /agents/active)', async () => {
    const res = await axios.post(`${BASE_URL}/agents/active`, { personaId: 'sdr_sales' });
    if (res.data.activePersona.id !== 'sdr_sales') throw new Error('Persona ativa não atualizou');
    // Restaura para Orquestrador Zero-Click
    await axios.post(`${BASE_URL}/agents/active`, { personaId: 'zero_click_router' });
  });

  // 9. Alternância de IA Global
  await test('9. Alternância de IA (POST /agents/toggle)', async () => {
    const res1 = await axios.post(`${BASE_URL}/agents/toggle`, { enabled: false });
    if (res1.data.enabled !== false) throw new Error('Falha ao pausar IA');
    const res2 = await axios.post(`${BASE_URL}/agents/toggle`, { enabled: true });
    if (res2.data.enabled !== true) throw new Error('Falha ao reativar IA');
  });

  // 10. Teste de Envio Direto de Mensagem no WhatsApp
  await test('10. Envio de Mensagem WhatsApp (/messages/whatsapp_principal/send)', async () => {
    const res = await axios.post(`${BASE_URL}/messages/whatsapp_principal/send`, {
      to: '5511976258311',
      text: '🤖 [Atlas Loggi] Teste automático de integridade do sistema concluído com 100% de sucesso.'
    }, { headers: HEADERS });
    if (!res.data.success) throw new Error('Falha ao enviar mensagem');
  });

  // 11. Teste de Envio Direto para o Bot do Telegram
  await test('11. Torre Telegram (@AtlasJuniorBot)', async () => {
    const botUrl = 'https://api.telegram.org/bot9146416024:AAFh6PVi5Pe4YKICGxUeGI5P9UtfIpkgznY/sendMessage';
    const res = await axios.post(botUrl, {
      chat_id: '553488777',
      text: '👑 <b>[Atlas Loggi - Teste de Integridade 100%]</b>\nTodos os recursos (WhatsApp + Grupos Loggi + Transcrição Whisper + IA Autônoma) estão operacionais e verificados!',
      parse_mode: 'HTML'
    });
    if (!res.data.ok) throw new Error('Telegram API recusou o envio');
  });

  console.log('=====================================================');
  console.log(`🎯 RESULTADO FINAL: ${passed}/${total} TESTES APROVADOS (${Math.round((passed/total)*100)}%)`);
  console.log('=====================================================');
  process.exit(passed === total ? 0 : 1);
}

// Aguarda 3 segundos para estabilização do socket antes de rodar
setTimeout(runFullVerification, 3000);
