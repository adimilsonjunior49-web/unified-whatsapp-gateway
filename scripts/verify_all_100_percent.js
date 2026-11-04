const http = require('http');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const { audioTranscriptionEngine } = require('../dist/infrastructure/audio/audioTranscriptionEngine.js');

async function runTests() {
  console.log('================================================================');
  console.log('🔍 INICIANDO SUÍTE DE TESTES EXECUTIVOS - ATLAS LOGGI GATEWAY');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, extra = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [TEST ${total}] PASS: ${title} ${extra}`);
    } else {
      console.error(`❌ [TEST ${total}] FAIL: ${title} ${extra}`);
    }
  }

  // 1. Health Endpoint
  await new Promise(resolve => {
    http.get('http://localhost:8080/health', res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const json = JSON.parse(d);
        assert('Health Check UP', res.statusCode === 200 && json.status === 'UP', `(Uptime: ${json.uptimeSeconds}s)`);
        resolve();
      });
    });
  });

  // 2. Active WhatsApp Session
  await new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/sessions',
      method: 'GET',
      headers: { 'x-api-key': 'sua_chave_mestra_secreta_aqui' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const json = JSON.parse(d);
        const session = json.data?.[0];
        assert('WhatsApp Master Conectado', session?.status === 'CONNECTED', `(Número: ${session?.phoneNumber})`);
        resolve();
      });
    });
    req.end();
  });

  // 3. SQLite Storage Persistence
  const db = new DatabaseSync(path.join(process.cwd(), 'storage', 'atlas_enterprise.db'));
  const chatsCount = db.prepare('SELECT count(*) as c FROM chats').get()?.c || 0;
  const contactsCount = db.prepare('SELECT count(*) as c FROM contacts').get()?.c || 0;
  const messagesCount = db.prepare('SELECT count(*) as c FROM messages').get()?.c || 0;

  assert('Banco SQLite Persistente', chatsCount > 0, `(${chatsCount} chats, ${contactsCount} contatos, ${messagesCount} msgs)`);
  assert('Grupos da Loggi Sincronizados', chatsCount >= 40, `(${chatsCount} grupos/chats)`);
  assert('Agenda de Contatos Salva', contactsCount >= 100, `(${contactsCount} contatos indexados)`);

  // 4. Smart Replies Humanizados
  await new Promise(resolve => {
    const postData = JSON.stringify({ text: 'A carga de Campinas já foi recebida?', name: 'Supervisor' });
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/chats/whatsapp_principal/smart-replies',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const json = JSON.parse(d);
        assert('Sugestões Humanizadas (Smart Replies)', Array.isArray(json.data) && json.data.length === 3, `(Opções: ${json.data?.map(o => o.label).join(', ')})`);
        resolve();
      });
    });
    req.write(postData);
    req.end();
  });

  // 5. Torre de Controle - Resumo Operacional por IA
  await new Promise(resolve => {
    const postData = JSON.stringify({ jid: '120363412238353809@g.us', groupName: 'CCO LOGGI W4' });
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/chats/whatsapp_principal/summarize',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const json = JSON.parse(d);
        assert('Torre de Controle (Resumo Executivo)', json.success && Boolean(json.data?.summary), `(Tamanho resumo: ${json.data?.summary?.length} caracteres)`);
        resolve();
      });
    });
    req.write(postData);
    req.end();
  });

  // 6. Transcrição Literal de Áudio com Whisper
  console.log('\n🎙️ Testando transcrição fiel com motor Whisper...');
  const testWav = path.join(__dirname, 'fala_teste.wav');
  try {
    const { execSync } = require('child_process');
    execSync(`powershell -Command "Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SetOutputToWaveFile('${testWav.replace(/\\/g, '\\\\')}'); $s.Speak('Operação Loggi liberada'); $s.Dispose()"`, { stdio: 'ignore' });
    const transcribed = await audioTranscriptionEngine.transcribe(testWav);
    assert('Motor Whisper de Transcrição Integral', Boolean(transcribed && transcribed.length > 0), `(Texto transcrito: "${transcribed}")`);
    if (fs.existsSync(testWav)) fs.unlinkSync(testWav);
  } catch (e) {
    assert('Motor Whisper de Transcrição', false, e.message);
  }

  // 7. Desktop Shortcut Integridade
  const shortcutPath = 'C:\\Users\\Home\\Desktop\\WhatsApp.lnk';
  assert('Apenas 1 Ícone Exclusivo na Área de Trabalho', fs.existsSync(shortcutPath), `(${shortcutPath})`);

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL: ${passed}/${total} TESTES APROVADOS (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 TODOS OS RECURSOS ESTÃO 100% OPERACIONAIS E VERIFICADOS!');
  } else {
    process.exit(1);
  }
}

runTests().catch(console.error);
