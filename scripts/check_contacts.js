const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/Home/.gemini/antigravity/scratch/unified-whatsapp-gateway/storage/atlas_enterprise.db');
const sNet = db.prepare("SELECT jid, name, notify, phone FROM contacts WHERE jid LIKE '%@s.whatsapp.net' LIMIT 15").all();
console.log('Contacts @s.whatsapp.net:', sNet.length, sNet);
const named = db.prepare("SELECT jid, name, notify, phone FROM contacts WHERE name != phone LIMIT 15").all();
console.log('Named contacts:', named.length, named);
