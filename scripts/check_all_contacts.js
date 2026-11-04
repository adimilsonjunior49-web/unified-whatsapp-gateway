const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'storage', 'atlas_enterprise.db');
const db = new DatabaseSync(dbPath);

console.log('=== DIAGNÓSTICO DE SINCRONIZAÇÃO DE CONTATOS ===');

// 1. Tabela Contacts
const totalContacts = db.prepare('SELECT count(*) as count FROM contacts').get().count;
console.log('1. Total de Contatos Indexados no SQLite:', totalContacts);

// 2. Chats Registrados
const totalChats = db.prepare('SELECT count(*) as count FROM chats').get().count;
const groupChats = db.prepare("SELECT count(*) as count FROM chats WHERE jid LIKE '%@g.us'").get().count;
const individualChats = db.prepare("SELECT count(*) as count FROM chats WHERE jid LIKE '%@s.whatsapp.net'").get().count;
console.log(`2. Total de Chats: ${totalChats} (Grupos: ${groupChats}, Individuais: ${individualChats})`);

// 3. Remetentes Únicos em Mensagens
const senders = db.prepare('SELECT count(DISTINCT sender_jid) as count FROM messages').get().count;
console.log('3. Remetentes Únicos que enviaram mensagens no histórico:', senders);

// 4. Analisar se todos os chats individuais estão em contacts
const missingIndividual = db.prepare(`
    SELECT c.jid, c.name 
    FROM chats c 
    LEFT JOIN contacts ct ON ct.jid = c.jid 
    WHERE c.jid LIKE '%@s.whatsapp.net' AND ct.jid IS NULL
`).all();
console.log('4. Chats individuais que faltam em contacts:', missingIndividual.length);

// 5. Inspecionar arquivos de sessão
const authDir = path.join(__dirname, '..', 'storage', 'sessions', 'whatsapp_principal');
if (fs.existsSync(authDir)) {
    const files = fs.readdirSync(authDir);
    console.log(`5. Arquivos na pasta de autenticação Baileys: ${files.length} arquivos.`);
}

// 6. Amostra de contatos com nome vs sem nome
const withName = db.prepare("SELECT count(*) as count FROM contacts WHERE name IS NOT NULL AND name != '' AND name != jid").get().count;
const onlyPhone = db.prepare("SELECT count(*) as count FROM contacts WHERE name IS NULL OR name = '' OR name = jid").get().count;
console.log(`6. Contatos com Nome Salvo: ${withName} | Contatos apenas com Telefone/JID: ${onlyPhone}`);

const lids = db.prepare("SELECT count(jid) as count FROM contacts WHERE jid LIKE '%@lid'").get().count;
const phones = db.prepare("SELECT count(jid) as count FROM contacts WHERE jid LIKE '%@s.whatsapp.net'").get().count;
console.log(`\nDetalhamento dos 3.908 Contatos:`);
console.log(`- Contatos com identificador de grupo (@lid): ${lids}`);
console.log(`- Contatos telefônicos diretos (@s.whatsapp.net): ${phones}`);

const phoneList = db.prepare("SELECT jid, name, notify, phone, company FROM contacts WHERE jid LIKE '%@s.whatsapp.net'").all();
console.log(`\nLista dos Contatos Telefônicos (@s.whatsapp.net):`);
console.table(phoneList);
