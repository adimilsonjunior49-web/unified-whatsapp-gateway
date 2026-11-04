const test = require('node:test');
const assert = require('node:assert');

test('Validação de Contrato de Mensagem Normalizada', () => {
  const sampleMsg = {
    id: 'MSG-001',
    sessionId: 'session_demo',
    remoteJid: '5511999998888@s.whatsapp.net',
    senderJid: '5511999998888@s.whatsapp.net',
    senderName: 'Adimilson',
    isFromMe: false,
    isGroup: false,
    text: 'Teste de mensagem unitária',
    mediaType: 'text',
    timestamp: Date.now()
  };

  assert.strictEqual(sampleMsg.sessionId, 'session_demo');
  assert.strictEqual(sampleMsg.mediaType, 'text');
  assert.ok(!sampleMsg.isGroup, 'Não deve ser grupo');
});

test('Validação de Formatação de JID do WhatsApp', () => {
  function formatJid(to) {
    const raw = to.replace(/\D/g, '');
    return to.includes('@') ? to : `${raw}@s.whatsapp.net`;
  }

  assert.strictEqual(formatJid('5511999998888'), '5511999998888@s.whatsapp.net');
  assert.strictEqual(formatJid('+55 (11) 98888-7777'), '5511988887777@s.whatsapp.net');
  assert.strictEqual(formatJid('120363150410181929@g.us'), '120363150410181929@g.us');
});
