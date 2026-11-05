const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (!code) continue;
  count++;
  try {
    new vm.Script(code);
    console.log(`Script #${count} [${code.length} chars]: SINTAXE VALIDA!`);
  } catch (err) {
    errors++;
    console.error(`Script #${count} ERRO:`, err.message);
  }
}

if (errors === 0) {
  console.log(`Todos os ${count} scripts em public/index.html sao 100% validos!`);
} else {
  process.exit(1);
}
