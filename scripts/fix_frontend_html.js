const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(htmlFile, 'utf8');

// Bloco antigo de funções do chat
const oldCode = `    async function loadChats() {
      try {
        const res = await fetch('/chats/' + SESSION_ID);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          allChats = data.data;
          filterChats();
        }
      } catch (err) {
        console.error('Erro ao carregar chats:', err);
      }
    }

    function filterChats() {
      const search = document.getElementById('chatSearchInput')?.value.toLowerCase() || '';
      const container = document.getElementById('chatListContainer');
      if (!container) return;

      const filtered = allChats.filter(c => {
        const matchCat = (c.category || 'LOGGI') === activeCategoryTab;
        const matchSearch = (c.name || '').toLowerCase().includes(search) || (c.jid || '').toLowerCase().includes(search);
        return matchCat && matchSearch;
      });

      if (filtered.length === 0) {
        container.innerHTML = \`<div class="p-8 text-center text-xs text-slate-500">Nenhuma conversa encontrada na aba \${activeCategoryTab}.</div>\`;
        return;
      }

      container.innerHTML = filtered.map(c => {
        const isSelected = c.jid === activeChatJid;
        const activeClass = isSelected ? 'bg-loggi-600/15 border-l-4 border-loggi-500' : 'hover:bg-obsidian-850';
        const isGroup = c.isGroup || c.jid.endsWith('@g.us');
        const badgeColor = c.category === 'LOGGI' ? 'bg-loggi-500/20 text-loggi-400' : 'bg-slate-700/40 text-slate-300';

        return \`
          <div onclick="selectChat('\${c.jid}', '\${escapeHtml(c.name || c.jid)}', '\${c.category}', \${c.isAiPaused || false})" class="p-3.5 cursor-pointer transition flex items-center space-x-3 \${activeClass}">
            <div class="w-10 h-10 rounded-2xl bg-obsidian-850 border border-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 flex-shrink-0">
              <i data-lucide="\${isGroup ? 'users' : 'user'}" class="w-5 h-5 text-slate-400"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-xs text-white truncate block">\${escapeHtml(c.name || c.jid)}</span>
                <span class="text-[10px] text-slate-500 font-mono">\${formatTimestamp(c.lastTimestamp)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-slate-400 truncate block max-w-[180px]">\${escapeHtml(c.lastMessage || 'Nenhuma mensagem')}</span>
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold \${badgeColor}">\${c.category}</span>
              </div>
            </div>
          </div>
        \`;
      }).join('');

      lucide.createIcons();
    }

    function selectChat(jid, name, category, isAiPaused) {
      activeChatJid = jid;
      document.getElementById('noChatSelectedPlaceholder').classList.add('hidden');
      document.getElementById('chatActiveWindow').classList.remove('hidden');

      document.getElementById('activeChatTitle').innerText = name;
      document.getElementById('activeChatJidBadge').innerText = jid;
      document.getElementById('activeChatCategoryBadge').innerText = category;
      document.getElementById('chatAiStateLabel').innerText = isAiPaused ? 'IA Pausada' : 'IA Ativa';

      loadChatMessages(jid);
      filterChats();
    }

    async function loadChatMessages(jid) {
      try {
        const res = await fetch(\`/chats/\${SESSION_ID}/\${jid}/messages\`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          renderMessagesTimeline(json.data);
        }
      } catch (err) {
        console.error('Erro ao buscar mensagens do chat:', err);
      }
    }

    function renderMessagesTimeline(messages) {
      const container = document.getElementById('messagesTimeline');
      if (!container) return;

      container.innerHTML = messages.map(m => {
        const isMe = m.isFromMe;
        const bubbleBg = isMe ? 'bg-loggi-600 text-white ml-auto' : 'bg-obsidian-850 text-slate-200 border border-slate-800 mr-auto';

        return \`
          <div class="flex flex-col max-w-[80%] \${isMe ? 'items-end ml-auto' : 'items-start mr-auto'}">
            <div class="px-4 py-2.5 rounded-2xl text-xs shadow-md \${bubbleBg}">
              \${!isMe ? \`<span class="text-[10px] font-bold text-sky-400 block mb-0.5">\${escapeHtml(m.senderName)}</span>\` : ''}
              <span>\${escapeHtml(m.text || '')}</span>
            </div>
            <span class="text-[9px] text-slate-500 font-mono mt-1 px-1">\${formatTimestamp(m.timestamp)}</span>
          </div>
        \`;
      }).join('');

      container.scrollTop = container.scrollHeight;
    }`;

const newCode = `    function updateCategoryBadgeCounts() {
      const loggiCount = allChats.filter(c => (c.category || 'LOGGI') === 'LOGGI').length;
      const pessoalCount = allChats.filter(c => c.category === 'PESSOAL').length;
      const loggiBtn = document.getElementById('tabBtnLoggi');
      const pessoalBtn = document.getElementById('tabBtnPessoal');
      if (loggiBtn) {
        loggiBtn.innerHTML = '<i data-lucide="package" class="w-3.5 h-3.5"></i> Loggi / Operações <span class="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-bold">' + loggiCount + '</span>';
      }
      if (pessoalBtn) {
        pessoalBtn.innerHTML = '<i data-lucide="user" class="w-3.5 h-3.5"></i> Pessoal <span class="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-bold">' + pessoalCount + '</span>';
      }
    }

    async function loadChats() {
      try {
        const res = await fetch('/chats/' + SESSION_ID);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          allChats = data.data.map(c => {
            const jid = c.jid || c.remoteJid || '';
            const isGroup = c.isGroup || (typeof jid === 'string' && jid.endsWith('@g.us'));
            let name = c.name;
            if (!name || name === jid) {
              name = isGroup ? 'Grupo WhatsApp Loggi' : jid.split('@')[0];
            }
            let cat = c.category;
            if (!cat) {
              cat = isGroup ? 'LOGGI' : 'PESSOAL';
            }
            return {
              ...c,
              jid: jid,
              remoteJid: jid,
              name: name,
              category: cat,
              isGroup: isGroup,
              lastTimestamp: c.lastTimestamp || c.timestamp || Math.floor(Date.now() / 1000),
              unreadCount: c.unreadCount || 0
            };
          });
          updateCategoryBadgeCounts();
          filterChats();

          // Auto-seleciona a primeira conversa se nenhuma estiver aberta
          if (!activeChatJid && allChats.length > 0) {
            const first = allChats.find(c => c.category === activeCategoryTab) || allChats[0];
            if (first) {
              selectChat(first.jid, first.name, first.category, first.isAiPaused || false);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar chats:', err);
      }
    }

    function filterChats() {
      const search = (document.getElementById('chatSearchInput')?.value || '').toLowerCase().trim();
      const container = document.getElementById('chatListContainer');
      if (!container) return;

      const filtered = allChats.filter(c => {
        const jid = c.jid || c.remoteJid || '';
        const matchCat = (c.category || 'LOGGI') === activeCategoryTab;
        const name = (c.name || '').toLowerCase();
        const msg = (c.lastMessage || '').toLowerCase();
        const matchSearch = !search || name.includes(search) || jid.toLowerCase().includes(search) || msg.includes(search);
        return matchCat && matchSearch;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2"><i data-lucide="inbox" class="w-8 h-8 text-slate-600 opacity-40"></i><span>Nenhuma conversa na aba ' + activeCategoryTab + '.</span><button onclick="switchCategoryTab(\\'' + (activeCategoryTab === 'LOGGI' ? 'PESSOAL' : 'LOGGI') + '\\')" class="mt-2 text-xs text-loggi-400 hover:underline">Alternar para aba ' + (activeCategoryTab === 'LOGGI' ? 'Pessoal' : 'Loggi') + '</button></div>';
        lucide.createIcons();
        return;
      }

      container.innerHTML = filtered.map(c => {
        const jid = c.jid || c.remoteJid || '';
        const isSelected = jid === activeChatJid;
        const activeClass = isSelected ? 'bg-loggi-600/20 border-l-4 border-loggi-500 shadow-sm' : 'hover:bg-obsidian-850';
        const isGroup = c.isGroup || (typeof jid === 'string' && jid.endsWith('@g.us'));
        const badgeColor = c.category === 'LOGGI' ? 'bg-loggi-500/20 text-loggi-400' : 'bg-slate-700/40 text-slate-300';
        const unreadBadge = (c.unreadCount && c.unreadCount > 0) ? '<span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-loggi-500 text-white shadow-sm shadow-loggi-500/40">' + c.unreadCount + '</span>' : '';

        return '<div onclick="selectChat(\\'' + jid + '\\', \\'' + escapeHtml(c.name || jid) + '\\', \\'' + c.category + '\\', ' + (c.isAiPaused || false) + ')" class="p-3.5 cursor-pointer transition flex items-center space-x-3 ' + activeClass + '">' +
          '<div class="w-10 h-10 rounded-2xl bg-obsidian-850 border border-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 flex-shrink-0 shadow-inner">' +
            '<i data-lucide="' + (isGroup ? 'users' : 'user') + '" class="w-5 h-5 text-slate-400"></i>' +
          '</div>' +
          '<div class="flex-1 min-w-0">' +
            '<div class="flex items-center justify-between mb-1">' +
              '<span class="font-bold text-xs text-white truncate block">' + escapeHtml(c.name || jid) + '</span>' +
              '<span class="text-[10px] text-slate-500 font-mono">' + formatTimestamp(c.lastTimestamp) + '</span>' +
            '</div>' +
            '<div class="flex items-center justify-between">' +
              '<span class="text-[11px] text-slate-400 truncate block max-w-[170px]">' + escapeHtml(c.lastMessage || 'Nenhuma mensagem recente') + '</span>' +
              '<div class="flex items-center gap-1.5">' +
                unreadBadge +
                '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold ' + badgeColor + '">' + c.category + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      lucide.createIcons();
    }

    function selectChat(jid, name, category, isAiPaused) {
      activeChatJid = jid;
      const placeholder = document.getElementById('noChatSelectedPlaceholder');
      const windowChat = document.getElementById('chatActiveWindow');
      if (placeholder) placeholder.classList.add('hidden');
      if (windowChat) windowChat.classList.remove('hidden');

      const titleEl = document.getElementById('activeChatTitle');
      const jidBadge = document.getElementById('activeChatJidBadge');
      const catBadge = document.getElementById('activeChatCategoryBadge');
      const aiLabel = document.getElementById('chatAiStateLabel');

      if (titleEl) titleEl.innerText = name;
      if (jidBadge) jidBadge.innerText = jid;
      if (catBadge) catBadge.innerText = category;
      if (aiLabel) aiLabel.innerText = isAiPaused ? 'IA Pausada' : 'IA Ativa';

      loadChatMessages(jid);
      filterChats();
    }

    async function loadChatMessages(jid) {
      try {
        const res = await fetch('/chats/' + SESSION_ID + '/' + jid + '/messages');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          renderMessagesTimeline(json.data);
        }
      } catch (err) {
        console.error('Erro ao buscar mensagens do chat:', err);
      }
    }

    function renderMessagesTimeline(messages) {
      const container = document.getElementById('messagesTimeline');
      if (!container) return;

      if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2"><i data-lucide="message-square" class="w-8 h-8 text-slate-600 opacity-40"></i><span>Nenhuma mensagem registrada nesta conversa. Digite abaixo para despachar.</span></div>';
        lucide.createIcons();
        return;
      }

      container.innerHTML = messages.map(m => {
        const isMe = m.isFromMe;
        const bubbleBg = isMe ? 'bg-loggi-600 text-white ml-auto shadow-md shadow-loggi-600/20' : 'bg-obsidian-850 text-slate-200 border border-slate-800 mr-auto shadow-md';
        const rawText = m.text ? escapeHtml(m.text).replace(/\\n/g, '<br>') : '';
        const mediaHtml = m.mediaUrl ? '<div class="mb-2 rounded-xl overflow-hidden max-h-56 border border-slate-700/50"><img src="' + m.mediaUrl + '" class="w-full h-auto object-cover cursor-pointer hover:opacity-95" onclick="window.open(\\'' + m.mediaUrl + '\\', \\'_blank\\')" alt="Comprovante/Foto" /></div>' : '';
        const displayText = rawText || mediaHtml ? (mediaHtml + rawText) : '<span class="italic text-slate-400 text-[11px]">(Mídia/evento recebido)</span>';

        return '<div class="flex flex-col max-w-[85%] ' + (isMe ? 'items-end ml-auto' : 'items-start mr-auto') + '">' +
          '<div class="px-4 py-2.5 rounded-2xl text-xs ' + bubbleBg + '">' +
            (!isMe ? '<span class="text-[10px] font-bold text-sky-400 block mb-1">' + escapeHtml(m.senderName || 'Remetente') + '</span>' : '') +
            '<div class="leading-relaxed break-words">' + displayText + '</div>' +
          '</div>' +
          '<span class="text-[9px] text-slate-500 font-mono mt-1 px-1">' + formatTimestamp(m.timestamp) + '</span>' +
        '</div>';
      }).join('');

      container.scrollTop = container.scrollHeight;
      lucide.createIcons();
    }`;

if (!html.includes(oldCode)) {
  console.error("Não encontrou o bloco oldCode exato!");
  process.exit(1);
}

html = html.replace(oldCode, newCode);

// Adicionar polling de auto-sincronização no final se não existir
const autoPollCode = `
    // Auto-sincronização periódica das conversas e timeline do chat
    setInterval(() => {
      loadChats();
      if (typeof activeChatJid !== 'undefined' && activeChatJid) {
        loadChatMessages(activeChatJid);
      }
    }, 4000);
`;

if (!html.includes("Auto-sincronização periódica")) {
  html = html.replace("loadChats();", "loadChats();" + autoPollCode);
}

fs.writeFileSync(htmlFile, html, 'utf8');
console.log("public/index.html atualizado com sucesso!");
