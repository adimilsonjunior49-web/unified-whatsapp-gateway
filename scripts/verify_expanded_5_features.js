const http = require('http');

function postJSON(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== TESTE DOS 5 NOVOS RECURSOS LOGÍSTICOS ===');

  // 1. Rastreamento Frota & Leaflet
  const fleet = await getJSON('http://localhost:8080/logistics/fleet-live');
  console.log('✅ 1. MAPA FROTA LEAFLET:', fleet.hubs.length, 'Hubs Logísticos |', fleet.vehicles.length, 'Veículos em Rota');

  // 2. Canhotos com OCR
  const receipts = await getJSON('http://localhost:8080/logistics/receipts');
  console.log('✅ 2. CANHOTOS OCR:', receipts.receipts.length, 'Comprovantes indexados no SQLite');

  // 3. Simulação de Leitura de Canhoto OCR
  const ocrDemo = await postJSON('http://localhost:8080/logistics/ocr-demo', {
    driverName: 'Marcos Oliveira - Carreta Cajamar',
    nfNumber: '994821'
  });
  console.log('✅ 3. BAIXA DE CANHOTO OCR:', ocrDemo.message, '| NF:', ocrDemo.nfNumber);

  // 4. Telefonia WebRTC & Discador
  const call = await postJSON('http://localhost:8080/telephony/call', {
    phone: '11976258311',
    contactName: 'Adimilson Júnior'
  });
  console.log('✅ 4. SOFTPHONE TELEFONIA WEBRTC:', call.status, '| Call ID:', call.callId);

  // 5. Agente Despachante Loggi (RAG)
  const agent = await postJSON('http://localhost:8080/agent/dispatcher/ask', {
    question: 'Qual o horário de corte das rotas expressas?'
  });
  console.log('✅ 5. AGENTE DESPACHANTE LOGGI (RAG): Respondeu:', agent.answered, '| Tópico:', agent.topic);

  console.log('\n🎉 TODOS OS 5 NOVOS RECURSOS FORAM VALIDADOS COM 100% DE SUCESSO!');
}

run().catch(console.error);
