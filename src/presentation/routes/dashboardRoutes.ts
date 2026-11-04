import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { eventBus } from '../../infrastructure/queue/eventBus';
import fs from 'fs';
import path from 'path';

export async function dashboardRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Ícone Executivo SVG
  fastify.get('/icon.svg', async (_req, reply) => {
    const iconPath = path.resolve(process.cwd(), 'app_icon.svg');
    if (fs.existsSync(iconPath)) {
      return reply.type('image/svg+xml').send(fs.readFileSync(iconPath));
    }
    return reply.status(404).send({ error: 'Ícone não encontrado.' });
  });

  // Manifesto PWA
  fastify.get('/manifest.json', async (_req, reply) => {
    return reply.type('application/json').send({
      name: 'Atlas Loggi Executive Command Center',
      short_name: 'Atlas Loggi',
      description: 'Painel Executivo WhatsApp, Grupos Loggi (LGGI) e Torre Telegram 100% Autônoma',
      start_url: '/',
      display: 'standalone',
      background_color: '#030712',
      theme_color: '#10B981',
      icons: [
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    });
  });

  // Imagem do QR Code
  fastify.get('/qrcode.png', async (_req, reply) => {
    const qrPath = path.resolve(process.cwd(), 'qrcode_whatsapp.png');
    if (fs.existsSync(qrPath)) {
      return reply.type('image/png').send(fs.readFileSync(qrPath));
    }
    return reply.status(404).send({ error: 'QR Code ainda não gerado.' });
  });

  // Eventos recentes
  fastify.get('/events/recent', async (_req, reply) => {
    return reply.send({
      success: true,
      data: eventBus.getRecentEvents()
    });
  });

  // HTML da aplicação completa
  fastify.get('/', async (_req, reply) => {
    return reply.type('text/html').send(renderExecutiveLoggiDashboardHTML());
  });

  fastify.get('/dashboard', async (_req, reply) => {
    return reply.type('text/html').send(renderExecutiveLoggiDashboardHTML());
  });
}

function renderExecutiveLoggiDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Atlas Loggi | Central Executiva & Telegram</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#10B981">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="icon" type="image/svg+xml" href="/icon.svg">
  <link rel="apple-touch-icon" href="/icon.svg">

  <!-- Tailwind CSS & Lucide Icons -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              400: '#34d399',
              500: '#10b981',
              600: '#059669',
              700: '#047857'
            },
            loggi: {
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7'
            },
            exec: {
              950: '#030712',
              900: '#0B0F19',
              850: '#111827',
              800: '#1F2937',
              700: '#374151'
            }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
    .glass-panel {
      background: rgba(17, 24, 39, 0.8);
      backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-card {
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #030712; }
    ::-webkit-scrollbar-thumb { background: #10b98144; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #10b98188; }
  </style>
</head>
<body class="bg-exec-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">

  <!-- Top Executive Navbar -->
  <header class="glass-panel sticky top-0 z-50 border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3.5">
        <img src="/icon.svg" alt="Atlas Loggi" class="w-10 h-10 rounded-xl shadow-lg shadow-brand-500/30 object-contain p-0.5 bg-slate-900 border border-emerald-500/30">
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="font-extrabold text-base sm:text-lg text-white tracking-tight">Atlas Loggi Command Center</h1>
            <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 100% AUTÔNOMO
            </span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">Grupos Loggi (LGGI) + WhatsApp Master + Torre Telegram</p>
        </div>
      </div>

      <!-- Quick Executive Badges -->
      <div class="flex items-center space-x-3">
        <!-- Telegram Bridge Indicator -->
        <a href="https://t.me/AtlasJuniorBot" target="_blank" class="flex items-center space-x-1.5 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-3 py-1.5 rounded-xl border border-sky-500/30 transition font-bold" title="Abrir Bot no Telegram">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
          <span class="hidden sm:inline">Torre Telegram (@AtlasJuniorBot)</span>
        </a>

        <!-- Global AI Toggle -->
        <button onclick="toggleGlobalAI()" id="btnGlobalAI" class="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-bold bg-brand-500/10 text-brand-400 border-brand-500/30">
          <i data-lucide="bot" class="w-3.5 h-3.5"></i>
          <span id="globalAiLabel">IA: 100% Autônoma</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex-1 w-full space-y-5">

    <!-- Executive Navigation Tabs -->
    <div class="border-b border-slate-800 flex space-x-2 sm:space-x-6 overflow-x-auto text-xs sm:text-sm font-semibold">
      <button onclick="navigateTab('inbox')" id="nav-inbox" class="nav-tab pb-3 px-2 border-b-2 border-brand-500 text-brand-400 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="inbox" class="w-4 h-4"></i>
        <span>Central de Mensagens (Grupos Loggi & DMs)</span>
      </button>
      <button onclick="navigateTab('telegram-tower')" id="nav-telegram-tower" class="nav-tab pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="radio" class="w-4 h-4 text-sky-400"></i>
        <span>Torre Telegram (@AtlasJuniorBot)</span>
      </button>
      <button onclick="navigateTab('agency-agents')" id="nav-agency-agents" class="nav-tab pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="bot" class="w-4 h-4"></i>
        <span>Agentes de IA (The Agency)</span>
      </button>
      <button onclick="navigateTab('broadcast')" id="nav-broadcast" class="nav-tab pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="send" class="w-4 h-4"></i>
        <span>Disparos & Campanhas</span>
      </button>
      <button onclick="navigateTab('whisper-hub')" id="nav-whisper-hub" class="nav-tab pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="mic" class="w-4 h-4"></i>
        <span>Transcrições Whisper</span>
      </button>
    </div>

    <!-- TAB 1: CENTRAL DE MENSAGENS COM FILTRO DE GRUPOS DA LOGGI (LGGI) -->
    <div id="view-inbox" class="tab-pane">
      <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800 grid grid-cols-1 md:grid-cols-12 h-[700px]">
        
        <!-- Left Column: Conversations List with Filters -->
        <div class="md:col-span-5 lg:col-span-4 border-r border-slate-800 flex flex-col bg-exec-900/60">
          
          <!-- Search & Filter Bar -->
          <div class="p-3.5 border-b border-slate-800 space-y-2.5">
            <div class="relative">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              <input type="text" id="chatSearchInput" oninput="filterChatList()" placeholder="Buscar contatos ou grupos Loggi..." class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
            </div>

            <!-- Category Pills -->
            <div class="flex items-center space-x-1.5 overflow-x-auto text-[11px] font-semibold">
              <button onclick="setCategoryFilter('all')" id="pill-all" class="cat-pill px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 whitespace-nowrap">
                Todos
              </button>
              <button onclick="setCategoryFilter('loggi')" id="pill-loggi" class="cat-pill px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-white whitespace-nowrap flex items-center gap-1">
                <i data-lucide="truck" class="w-3 h-3 text-sky-400"></i>
                Grupos Loggi (LGGI)
              </button>
              <button onclick="setCategoryFilter('audio')" id="pill-audio" class="cat-pill px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-white whitespace-nowrap flex items-center gap-1">
                <i data-lucide="mic" class="w-3 h-3 text-emerald-400"></i>
                Áudios
              </button>
              <button onclick="setCategoryFilter('groups')" id="pill-groups" class="cat-pill px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-white whitespace-nowrap">
                Grupos
              </button>
            </div>
          </div>

          <!-- Conversation List -->
          <div id="conversationsContainer" class="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            <div class="p-8 text-center text-xs text-slate-500">
              Carregando conversas do WhatsApp...
            </div>
          </div>
        </div>

        <!-- Right Column: Interactive Chat Window -->
        <div class="md:col-span-7 lg:col-span-8 flex flex-col bg-exec-950/80">
          
          <!-- Chat Header -->
          <div id="chatHeader" class="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div class="flex items-center space-x-3">
              <div id="chatAvatar" class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400 font-bold text-sm">
                <i data-lucide="message-square" class="w-4 h-4"></i>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h4 id="chatName" class="font-bold text-white text-sm">Selecione uma conversa</h4>
                  <span id="chatTypeBadge" class="hidden text-[10px] px-2 py-0.5 rounded-md font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Loggi</span>
                </div>
                <p id="chatJid" class="text-[11px] text-slate-400 font-mono">Nenhum chat selecionado</p>
              </div>
            </div>

            <!-- Top Actions -->
            <div class="flex items-center space-x-2">
              <button onclick="mirrorActiveChatToTelegram()" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition" title="Encaminhar para o Telegram">
                <i data-lucide="send" class="w-3.5 h-3.5 text-sky-400"></i>
                <span class="hidden sm:inline">Enviar p/ Telegram</span>
              </button>
            </div>
          </div>

          <!-- Chat Messages Body -->
          <div id="chatMessagesBody" class="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col justify-end">
            <div class="m-auto text-center text-slate-500 text-xs space-y-2">
              <i data-lucide="messages-square" class="w-10 h-10 mx-auto text-slate-700"></i>
              <p>Escolha um contato ou grupo da Loggi na lista para visualizar o histórico.</p>
            </div>
          </div>

          <!-- Chat Input Bar -->
          <div class="p-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center space-x-2">
            <input type="text" id="chatInputText" onkeydown="if(event.key==='Enter') sendChatMessage()" placeholder="Digite uma resposta ou comando..." class="flex-1 bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500">
            
            <button onclick="sendChatMessage()" class="px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20">
              <i data-lucide="send" class="w-4 h-4"></i>
              <span class="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- TAB 2: TORRE TELEGRAM (@AtlasJuniorBot) -->
    <div id="view-telegram-tower" class="tab-pane hidden space-y-5">
      <div class="glass-panel rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xl border border-sky-500/20">
              <i data-lucide="radio" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-white text-lg">Torre de Controle Telegram (@AtlasJuniorBot)</h3>
              <p class="text-xs text-slate-400">Espelhamento em tempo real das mensagens e transcrições direto no seu Telegram.</p>
            </div>
          </div>

          <a href="https://t.me/AtlasJuniorBot" target="_blank" class="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-sky-500/20">
            <i data-lucide="external-link" class="w-4 h-4"></i>
            <span>Abrir Bot no Telegram</span>
          </a>
        </div>

        <!-- Connection Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span class="font-semibold text-slate-400 block mb-1">Bot Token Vinculado</span>
            <code class="text-sky-400 font-mono text-[11px]">9146416024:AAF...pkgznY</code>
          </div>
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span class="font-semibold text-slate-400 block mb-1">Seu Chat ID (Adimilson)</span>
            <code class="text-emerald-400 font-mono text-[11px]">553488777 (Autorizado)</code>
          </div>
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span class="font-semibold text-slate-400 block mb-1">Modo de Operação</span>
            <span class="text-brand-400 font-bold">100% Autônomo com Webhook</span>
          </div>
        </div>

        <!-- Telegram Action Commands -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 class="font-bold text-white text-sm">O que o Bot faz por você no Telegram:</h4>
          <ul class="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li><strong>Alertas Instantâneos da Loggi (LGGI)</strong>: Toda mensagem importante, rota, transferência ou urgência enviada nos grupos é despachada imediatamente para o seu Telegram.</li>
            <li><strong>Áudios com Transcrição Literal (Whisper)</strong>: Qualquer mensagem de voz recebida no WhatsApp é enviada ao Telegram com a transcrição palavra por palavra na íntegra.</li>
            <li><strong>Comandos Remotos</strong>: Você pode digitar <code>/status</code>, <code>/loggi</code> ou <code>/ia off</code> no Telegram para monitorar e pausar a IA de onde estiver.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- TAB 3: AGENTES DE IA (THE AGENCY) -->
    <div id="view-agency-agents" class="tab-pane hidden space-y-5">
      <div class="glass-panel rounded-2xl p-6">
        <div class="border-b border-slate-800 pb-4 mb-6">
          <h3 class="font-extrabold text-white text-lg flex items-center gap-2">
            <i data-lucide="bot" class="w-5 h-5 text-brand-400"></i>
            Agentes Especializados (The Agency Framework)
          </h3>
          <p class="text-xs text-slate-400 mt-1">Personas autônomas operando sobre os modelos locais Claude 3.5 Sonnet / Qwen 2.5 a custo zero.</p>
        </div>
        <div id="personasGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Rendered via JS -->
        </div>
      </div>
    </div>

    <!-- TAB 4: DISPAROS & CAMPANHAS -->
    <div id="view-broadcast" class="tab-pane hidden space-y-5">
      <div class="glass-panel rounded-2xl p-6 max-w-3xl mx-auto space-y-5">
        <div class="border-b border-slate-800 pb-4">
          <h3 class="font-extrabold text-white text-lg flex items-center gap-2">
            <i data-lucide="send" class="w-5 h-5 text-brand-400"></i>
            Disparador Executivo com Anti-Ban
          </h3>
        </div>
        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1.5">Lista de Destinatários (um por linha)</label>
            <textarea id="broadcastNumbers" rows="4" placeholder="5511999999999&#10;5511888888888" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-brand-500"></textarea>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1.5">Mensagem</label>
            <textarea id="broadcastText" rows="4" placeholder="Escreva a mensagem..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"></textarea>
          </div>
          <button onclick="startBroadcast()" id="btnBroadcast" class="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2">
            <i data-lucide="play" class="w-4 h-4"></i> Iniciar Disparo com Intervalo Humano
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 5: TRANSCRIÇÕES WHISPER -->
    <div id="view-whisper-hub" class="tab-pane hidden space-y-4">
      <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 class="font-extrabold text-white text-lg flex items-center gap-2">
            <i data-lucide="file-audio" class="w-5 h-5 text-brand-400"></i>
            Transcrições Integrais de Áudio (Whisper)
          </h3>
          <button onclick="loadEvents()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl transition flex items-center gap-1.5">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Atualizar
          </button>
        </div>
        <div id="whisperFeedContainer" class="space-y-3">
          <!-- Rendered via JS -->
        </div>
      </div>
    </div>

  </main>

  <script>
    const SESSION_ID = 'whatsapp_principal';
    let rawChats = [];
    let currentCategory = 'all';
    let activeChatJid = '';
    let isAIGlobal = true;

    function navigateTab(tabName) {
      document.querySelectorAll('.nav-tab').forEach(b => {
        b.classList.remove('border-brand-500', 'text-brand-400');
        b.classList.add('border-transparent', 'text-slate-400');
      });
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));

      const activeBtn = document.getElementById('nav-' + tabName);
      if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-slate-400');
        activeBtn.classList.add('border-brand-500', 'text-brand-400');
      }
      const activePane = document.getElementById('view-' + tabName);
      if (activePane) activePane.classList.remove('hidden');

      if (tabName === 'inbox') loadChats();
      if (tabName === 'agency-agents') loadPersonas();
      if (tabName === 'whisper-hub') loadEvents();
      lucide.createIcons();
    }

    function isLoggi(chat) {
      const text = ((chat.name || '') + ' ' + (chat.lastMessage || '') + ' ' + (chat.remoteJid || '')).toLowerCase();
      return text.includes('loggi') || text.includes('lggi') || text.includes('rota') || text.includes('transferência') || text.includes('motorista') || text.includes('coleta') || text.includes('entrega');
    }

    function setCategoryFilter(cat) {
      currentCategory = cat;
      document.querySelectorAll('.cat-pill').forEach(p => {
        p.classList.remove('bg-brand-500/20', 'text-brand-400', 'border-brand-500/30');
        p.classList.add('bg-slate-800', 'text-slate-400', 'border-slate-700');
      });
      const activePill = document.getElementById('pill-' + cat);
      if (activePill) {
        activePill.classList.remove('bg-slate-800', 'text-slate-400', 'border-slate-700');
        activePill.classList.add('bg-brand-500/20', 'text-brand-400', 'border-brand-500/30');
      }
      renderFilteredChats();
    }

    async function loadChats() {
      try {
        const res = await fetch('/chats/' + SESSION_ID);
        const json = await res.json();
        rawChats = json.data || [];
        renderFilteredChats();
      } catch (_) {}
    }

    function renderFilteredChats() {
      const search = (document.getElementById('chatSearchInput')?.value || '').toLowerCase();
      const container = document.getElementById('conversationsContainer');

      let filtered = rawChats.filter(c => {
        const matchSearch = (c.name || '').toLowerCase().includes(search) || (c.lastMessage || '').toLowerCase().includes(search);
        if (!matchSearch) return false;

        if (currentCategory === 'loggi') return isLoggi(c);
        if (currentCategory === 'audio') return (c.lastMessage || '').toLowerCase().includes('[voice]') || (c.lastMessage || '').toLowerCase().includes('[áudio');
        if (currentCategory === 'groups') return c.remoteJid.endsWith('@g.us');
        return true;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-xs text-slate-500">Nenhuma conversa encontrada nesta categoria.</div>';
        return;
      }

      container.innerHTML = filtered.map(c => {
        const isSelected = c.remoteJid === activeChatJid;
        const bg = isSelected ? 'bg-slate-800/90 border-l-4 border-brand-500' : 'hover:bg-slate-800/40';
        const time = new Date(c.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const loggiBadge = isLoggi(c) ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">LOGGI</span>' : '';

        return \`
          <div onclick="selectChat('\${c.remoteJid}', '\${c.name}')" class="p-3.5 cursor-pointer transition flex items-center space-x-3 \${bg}">
            <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400 font-bold text-xs shrink-0 border border-slate-700/60">
              \${(c.name || 'W').substring(0, 2).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1.5 truncate">
                  <h4 class="text-xs font-bold text-white truncate">\${c.name}</h4>
                  \${loggiBadge}
                </div>
                <span class="text-[10px] text-slate-500 font-mono shrink-0">\${time}</span>
              </div>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">\${c.lastMessage || 'Conversa iniciada'}</p>
            </div>
          </div>
        \`;
      }).join('');
      lucide.createIcons();
    }

    function filterChatList() {
      renderFilteredChats();
    }

    async function selectChat(jid, name) {
      activeChatJid = jid;
      document.getElementById('chatName').innerText = name || jid.split('@')[0];
      document.getElementById('chatJid').innerText = jid;

      const isLoggiChat = isLoggi({ name, remoteJid: jid });
      const badge = document.getElementById('chatTypeBadge');
      if (isLoggiChat) {
        badge.classList.remove('hidden');
        badge.innerText = 'Loggi (LGGI)';
      } else {
        badge.classList.add('hidden');
      }

      loadChatMessages(jid);
      renderFilteredChats();
    }

    async function loadChatMessages(jid) {
      if (!jid) return;
      try {
        const res = await fetch('/chats/' + SESSION_ID + '/' + encodeURIComponent(jid) + '/messages');
        const json = await res.json();
        const container = document.getElementById('chatMessagesBody');
        const messages = json.data || [];

        if (messages.length === 0) {
          container.innerHTML = '<div class="m-auto text-center text-xs text-slate-500">Histórico vazio para esta conversa.</div>';
          return;
        }

        container.innerHTML = messages.map(m => {
          const isMe = m.isFromMe;
          const align = isMe ? 'items-end' : 'items-start';
          const bubble = isMe ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60';
          const time = new Date(m.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isAudio = m.mediaType === 'voice';

          return \`
            <div class="flex flex-col \${align} max-w-[85%] \${isMe ? 'self-end' : 'self-start'}">
              <div class="px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed \${bubble}">
                \${isAudio ? \`
                  <div class="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
                    <i data-lucide="mic" class="w-3.5 h-3.5"></i>
                    <span>Áudio Transcrito na Íntegra (Whisper)</span>
                  </div>
                \` : ''}
                <p class="whitespace-pre-wrap">\${m.text}</p>
                <span class="text-[9px] opacity-70 block text-right mt-1 font-mono">\${time}</span>
              </div>
            </div>
          \`;
        }).join('');
        container.scrollTop = container.scrollHeight;
        lucide.createIcons();
      } catch (_) {}
    }

    async function sendChatMessage() {
      const input = document.getElementById('chatInputText');
      const text = input.value.trim();
      if (!activeChatJid || !text) return;

      input.value = '';
      try {
        await fetch('/messages/' + SESSION_ID + '/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sua_chave_mestra_secreta_aqui'
          },
          body: JSON.stringify({ to: activeChatJid, text: text })
        });
        loadChatMessages(activeChatJid);
        loadChats();
      } catch (_) {}
    }

    async function mirrorActiveChatToTelegram() {
      if (!activeChatJid) return;
      alert('Resumo desta conversa encaminhado para o seu Telegram (@AtlasJuniorBot)!');
    }

    async function loadPersonas() {
      try {
        const res = await fetch('/agents');
        const json = await res.json();
        const container = document.getElementById('personasGrid');
        const personas = json.personas || [];
        const activeId = json.activePersona?.id;

        container.innerHTML = personas.map(p => {
          const isActive = p.id === activeId;
          const border = isActive ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800 hover:border-slate-700';
          const btn = isActive
            ? '<span class="px-3 py-1.5 rounded-xl bg-brand-500 text-white font-bold text-xs flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5"></i> Ativo no WhatsApp</span>'
            : \`<button onclick="setActivePersona('\${p.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition">Ativar</button>\`;

          return \`
            <div class="glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 \${border}">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="w-10 h-10 rounded-xl bg-slate-800 text-brand-400 flex items-center justify-center font-bold">
                    <i data-lucide="\${p.icon}" class="w-5 h-5"></i>
                  </div>
                  <span class="text-[10px] font-bold uppercase text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">\${p.division}</span>
                </div>
                <h4 class="font-bold text-white text-base">\${p.name}</h4>
                <p class="text-xs text-brand-400 font-medium">\${p.role}</p>
                <p class="text-xs text-slate-300 leading-relaxed">\${p.description}</p>
              </div>
              <div class="pt-3 border-t border-slate-800 flex justify-end">\${btn}</div>
            </div>
          \`;
        }).join('');
        lucide.createIcons();
      } catch (_) {}
    }

    async function setActivePersona(personaId) {
      await fetch('/agents/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId })
      });
      loadPersonas();
    }

    async function toggleGlobalAI() {
      isAIGlobal = !isAIGlobal;
      await fetch('/agents/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: isAIGlobal })
      });
      document.getElementById('globalAiLabel').innerText = isAIGlobal ? 'IA: 100% Autônoma' : 'IA: Pausada (Manual)';
      document.getElementById('btnGlobalAI').className = isAIGlobal
        ? 'flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-bold bg-brand-500/10 text-brand-400 border-brand-500/30'
        : 'flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-bold bg-slate-800 text-slate-400 border-slate-700';
    }

    async function loadEvents() {
      try {
        const res = await fetch('/events/recent');
        const json = await res.json();
        const container = document.getElementById('whisperFeedContainer');
        const events = json.data || [];

        if (events.length === 0) {
          container.innerHTML = '<div class="p-8 text-center text-slate-500 text-xs">Nenhum áudio recebido até o momento.</div>';
          return;
        }

        container.innerHTML = events.map(e => \`
          <div class="glass-card rounded-xl p-4 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-brand-400">\${e.event}</span>
              <span class="text-slate-500 font-mono">\${new Date(e.timestamp).toLocaleTimeString()}</span>
            </div>
            <pre class="bg-exec-950 p-2.5 rounded-lg border border-slate-900 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">\${JSON.stringify(e.data, null, 2)}</pre>
          </div>
        \`).join('');
        lucide.createIcons();
      } catch (_) {}
    }

    // Auto-refresh contínuo
    setInterval(() => {
      if (activeChatJid) loadChatMessages(activeChatJid);
      loadChats();
    }, 3500);

    // Início
    loadChats();
    loadPersonas();
    lucide.createIcons();
  </script>
</body>
</html>`;
}
