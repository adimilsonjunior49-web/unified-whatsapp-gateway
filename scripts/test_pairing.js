const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

async function testPairing() {
  const sessionDir = path.join(__dirname, '../sessions/test_pair');
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }
  fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'debug' }),
    printQRInTerminal: false,
    auth: state,
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    console.log('[CONN UPDATE]:', update.connection, update.lastDisconnect?.error?.message || '');
  });

  console.log('Aguardando 4 segundos antes de solicitar pairing code...');
  await new Promise(r => setTimeout(r, 4000));

  try {
    const code = await sock.requestPairingCode('551176258311');
    console.log('>>> PAIRING CODE GERADO COM SUCESSO:', code);
  } catch (err) {
    console.error('>>> ERRO AO GERAR PAIRING CODE:', err);
  }
}

testPairing();
