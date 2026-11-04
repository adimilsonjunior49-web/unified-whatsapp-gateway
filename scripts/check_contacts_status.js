const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'storage', 'atlas_enterprise.db');
const db = new DatabaseSync(dbPath);

console.log('--- STATUS DA SINCRONIZAÇÃO DE CONTATOS ---');
const total = db.prepare('SELECT count(*) as count FROM contacts WHERE session_id = ?').get('whatsapp_principal');
console.log('Total de Contatos Salvos e Indexados:', total.count);

const categories = db.prepare(`
    SELECT category, count(*) as count 
    FROM contacts 
    WHERE session_id = ? 
    GROUP BY category
`).all('whatsapp_principal');
console.log('\nDistribuição por Categoria:');
console.table(categories);

const sample = db.prepare(`
    SELECT name, phone, category, company, role 
    FROM contacts 
    WHERE session_id = ? 
    LIMIT 10
`).all('whatsapp_principal');
console.log('\nAmostra de Contatos Salvos:');
console.table(sample);

// Verificar mensagens e remetentes únicos no banco
const uniqueSenders = db.prepare(`
    SELECT count(DISTINCT sender_jid) as count 
    FROM messages 
    WHERE session_id = ?
`).get('whatsapp_principal');
console.log('\nRemetentes Únicos em Mensagens:', uniqueSenders.count);
