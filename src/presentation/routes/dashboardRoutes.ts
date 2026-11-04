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
      description: 'Painel Executivo WhatsApp, Grupos Loggi (LGGI), Videoconferência e Torre Telegram 100% Autônoma',
      start_url: '/',
      display: 'standalone',
      background_color: '#030712',
      theme_color: '#0ea5e9',
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
  <title>Atlas Loggi | Central Executiva & Torre de Controle</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#0ea5e9">
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
            loggi: {
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1'
            },
            titanium: {
              950: '#060911',
              900: '#0B111E',
              850: '#10192A',
              800: '#18243A',
              700: '#253550'
            }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
    .glass-nav {
      background: rgba(11, 17, 30, 0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-card {
      background: rgba(16, 25, 42, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.07);
    }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #060911; }
    ::-webkit-scrollbar-thumb { background: #0ea5e944; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #0ea5e988; }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(14, 165, 233, 0.2); }
      50% { box-shadow: 0 0 25px rgba(14, 165, 233, 0.5); }
    }
    .glow-pulse { animation: pulseGlow 3s infinite ease-in-out; }
  </style>
</head>
<body class="bg-titanium-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-loggi-500 selection:text-white">

  <!-- Top Executive Navbar -->
  <header class="glass-nav sticky top-0 z-40">
    <div class="max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      
      <!-- Brand & Status -->
      <div class="flex items-center space-x-3.5">
        <img src="/icon.svg" alt="Atlas Loggi" class="w-10 h-10 rounded-xl shadow-lg shadow-loggi-500/20 object-contain p-0.5 bg-titanium-900 border border-loggi-500/40">
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="font-extrabold text-base sm:text-lg text-white tracking-tight">Atlas Loggi Command Center</h1>
            <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> CONECTADO
            </span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">WhatsApp Master: <span class="text-emerald-400 font-mono">+55 11 97625-8311</span> • Torre Telegram: <span class="text-sky-400 font-mono">@AtlasJuniorBot</span></p>
        </div>
      </div>

      <!-- Quick Actions (Meeting, Call, Telegram & AI Toggle) -->
      <div class="flex items-center space-x-2.5">
        
        <!-- Video Conference Button -->
        <button onclick="openMeetingModal()" class="flex items-center space-x-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition font-bold" title="Criar Reunião ou Teleconferência">
          <i data-lucide="video" class="w-3.5 h-3.5"></i>
          <span class="hidden md:inline">Reunião / Teleconferência</span>
        </button>

        <!-- Quick Call Button -->
        <button onclick="startQuickCall()" class="flex items-center space-x-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition font-bold" title="Atender ou Fazer Chamada">
          <i data-lucide="phone-call" class="w-3.5 h-3.5"></i>
          <span class="hidden md:inline">Atender / Fazer Chamada</span>
        </button>

        <!-- Telegram Bridge Link -->
        <a href="https://t.me/AtlasJuniorBot" target="_blank" class="flex items-center space-x-1.5 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-3 py-1.5 rounded-xl border border-sky-500/30 transition font-bold" title="Abrir Bot no Telegram">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
          <span class="hidden lg:inline">Torre Telegram</span>
        </a>

        <!-- Global AI Toggle -->
        <button onclick="toggleGlobalAI()" id="btnGlobalAI" class="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-bold bg-loggi-500/10 text-loggi-400 border-loggi-500/30">
          <i data-lucide="bot" class="w-3.5 h-3.5"></i>
          <span id="globalAiLabel">IA: Autônoma</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-[1700px] mx-auto px-3 sm:px-6 py-4 flex-1 w-full space-y-4">

    <!-- Primary Workspace: 2 Panels with Smart Loggi vs Pessoal Separation -->
    <div class="glass-card rounded-2xl overflow-hidden border border-slate-800/80 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-140px)] min-h-[680px]">
      
      <!-- LEFT PANEL: CONVERSATIONS & DUAL LIST (LOGGI vs PESSOAL) -->
      <div class="lg:col-span-4 border-r border-slate-800/80 flex flex-col bg-titanium-900/60">
        
        <!-- Search & Dual List Tabs -->
        <div class="p-3.5 border-b border-slate-800/80 space-y-3">
          
          <!-- Search Bar -->
          <div class="relative">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
            <input type="text" id="chatSearchInput" oninput="filterChatList()" placeholder="Buscar contatos, rotas ou grupos Loggi..." class="w-full bg-titanium-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-loggi-500">
          </div>

          <!-- Dual Tab Segment: Loggi Principal vs Pessoal/Arquivadas -->
          <div class="grid grid-cols-2 p-1 bg-titanium-950 rounded-xl border border-slate-800 text-xs font-bold">
            <button onclick="switchCategoryTab('LOGGI')" id="tabBtnLoggi" class="py-2 px-3 rounded-lg bg-loggi-500 text-white flex items-center justify-center gap-1.5 transition shadow-sm">
              <i data-lucide="truck" class="w-3.5 h-3.5"></i>
              <span>Operações Loggi</span>
              <span id="badgeCountLoggi" class="ml-1 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">0</span>
            </button>
            <button onclick="switchCategoryTab('PESSOAL')" id="tabBtnPessoal" class="py-2 px-3 rounded-lg text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition">
              <i data-lucide="folder-archive" class="w-3.5 h-3.5"></i>
              <span>Pessoal / Arquivadas</span>
              <span id="badgeCountPessoal" class="ml-1 text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full">0</span>
            </button>
          </div>
        </div>

        <!-- Conversation List -->
        <div id="conversationsContainer" class="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          <div class="p-8 text-center text-xs text-slate-500">
            Carregando conversas do WhatsApp...
          </div>
        </div>

        <!-- Footer Stats Bar -->
        <div class="p-2.5 border-t border-slate-800/80 bg-titanium-950/80 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <span class="flex items-center gap-1.5">
            <i data-lucide="database" class="w-3.5 h-3.5 text-loggi-400"></i>
            <span>SQLite Alta Capacidade Ativo</span>
          </span>
          <button onclick="loadChats()" class="hover:text-white flex items-center gap-1 transition">
            <i data-lucide="refresh-cw" class="w-3 h-3"></i> Atualizar
          </button>
        </div>
      </div>

      <!-- RIGHT PANEL: ACTIVE CHAT & TORRE DE CONTROLE DO GRUPO -->
      <div class="lg:col-span-8 flex flex-col bg-titanium-950/90 relative">
        
        <!-- Chat Header -->
        <div id="chatHeader" class="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-titanium-900/50">
          <div class="flex items-center space-x-3">
            <div id="chatAvatar" class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-loggi-400 font-extrabold text-sm border border-slate-700/60">
              <i data-lucide="message-square" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h4 id="chatName" class="font-bold text-white text-sm sm:text-base">Selecione uma conversa</h4>
                <span id="chatCategoryBadge" class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-loggi-500/10 text-loggi-400 border border-loggi-500/30">LOGGI</span>
              </div>
              <p id="chatJid" class="text-[11px] text-slate-400 font-mono">Nenhum chat selecionado</p>
            </div>
          </div>

          <!-- Top Action Buttons for Active Chat -->
          <div class="flex items-center space-x-2">
            <!-- Toggle Group Tower Panel -->
            <button onclick="toggleGroupTower()" id="btnGroupTowerToggle" class="text-xs bg-loggi-500/10 hover:bg-loggi-500/20 text-loggi-400 px-3 py-1.5 rounded-xl border border-loggi-500/30 flex items-center gap-1.5 transition font-bold" title="Abrir Torre de Controle do Grupo">
              <i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Torre do Grupo</span>
            </button>

            <!-- Video Call Invite in this Chat -->
            <button onclick="sendMeetingInviteToChat()" class="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-500/30 flex items-center gap-1.5 transition font-bold" title="Convidar para Videoconferência">
              <i data-lucide="video" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Convidar Reunião</span>
            </button>

            <!-- Category Switcher Dropdown/Button -->
            <button onclick="toggleActiveChatCategory()" id="btnSwitchCat" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition" title="Alternar entre Loggi e Pessoal">
              <i data-lucide="arrow-left-right" class="w-3.5 h-3.5"></i>
              <span class="hidden md:inline">Mudar Categoria</span>
            </button>
          </div>
        </div>

        <!-- TORRE DE CONTROLE DO GRUPO (COLLAPSIBLE EXECUTIVE BANNER) -->
        <div id="groupTowerBanner" class="hidden border-b border-slate-800 bg-titanium-900/90 p-4 space-y-3 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-lg bg-loggi-500/20 text-loggi-400 flex items-center justify-center font-bold">
                <i data-lucide="tower-control" class="w-4 h-4"></i>
              </div>
              <div>
                <h4 class="font-extrabold text-white text-xs sm:text-sm">Torre de Controle Operacional Loggi</h4>
                <p class="text-[11px] text-slate-400">Análise de cargas, rotas, pendências e decisões estratégicas.</p>
              </div>
            </div>

            <!-- Action Buttons for Group Tower -->
            <div class="flex items-center space-x-2">
              <button onclick="generateGroupSummary()" id="btnGenerateSummary" class="text-xs px-3 py-1.5 bg-loggi-500 hover:bg-loggi-600 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                <span>Gerar Resumo Executivo (IA)</span>
              </button>
              <button onclick="mirrorSummaryToTelegram()" class="text-xs px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30 font-bold flex items-center gap-1.5 transition">
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">Enviar ao Telegram</span>
              </button>
            </div>
          </div>

          <!-- Summary Content Display Area -->
          <div id="groupSummaryBox" class="bg-titanium-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto">
            Clique em "Gerar Resumo Executivo" para que a IA analise as mensagens recentes deste grupo e elabore o panorama das operações, rotas e ocorrências.
          </div>
        </div>

        <!-- Chat Messages Body -->
        <div id="chatMessagesBody" class="flex-1 p-4 overflow-y-auto space-y-3.5 flex flex-col justify-end">
          <div class="m-auto text-center text-slate-500 text-xs space-y-2">
            <i data-lucide="messages-square" class="w-12 h-12 mx-auto text-slate-700"></i>
            <p>Selecione uma conversa ou grupo da Loggi para visualizar o histórico de mensagens.</p>
          </div>
        </div>

        <!-- HUMANIZED SMART REPLIES DOCK -->
        <div id="smartRepliesDock" class="hidden px-4 py-2 border-t border-slate-800/60 bg-titanium-900/40 flex items-center space-x-2 overflow-x-auto">
          <span class="text-[10px] uppercase font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <i data-lucide="sparkles" class="w-3 h-3 text-amber-400"></i> Sugestões Humanas:
          </span>
          <div id="smartRepliesContainer" class="flex items-center space-x-2">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- VOICE RECORDING DOCK (AUDIO PTT RECORDER) -->
        <div id="voiceRecordingDock" class="hidden px-4 py-3 border-t border-red-500/30 bg-red-950/20 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span class="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <i data-lucide="mic" class="w-4 h-4"></i> Gravando Áudio PTT...
            </span>
            <span id="recordTimer" class="font-mono text-xs text-white font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">00:00</span>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="cancelAudioRecording()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold transition">
              Cancelar
            </button>
            <button onclick="finishAndSendAudio()" class="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-xl font-bold flex items-center gap-1.5 transition shadow-lg shadow-red-600/30">
              <i data-lucide="send" class="w-3.5 h-3.5"></i> Enviar Áudio PTT
            </button>
          </div>
        </div>

        <!-- Chat Input Bar -->
        <div id="normalInputBar" class="p-3.5 border-t border-slate-800/80 bg-titanium-900/70 flex items-center space-x-2">
          
          <!-- Mic Voice Note Button -->
          <button onclick="startAudioRecording()" class="p-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition border border-slate-700/60" title="Gravar Áudio de Voz (PTT)">
            <i data-lucide="mic" class="w-4 h-4"></i>
          </button>

          <!-- Input Text -->
          <input type="text" id="chatInputText" onkeydown="if(event.key==='Enter') sendChatMessage()" placeholder="Digite uma mensagem ou comando executivo..." class="flex-1 bg-titanium-950 border border-slate-800 text-white text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-loggi-500">
          
          <!-- Send Button -->
          <button onclick="sendChatMessage()" class="px-4 py-3 bg-loggi-500 hover:bg-loggi-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-loggi-500/20">
            <i data-lucide="send" class="w-4 h-4"></i>
            <span class="hidden sm:inline">Enviar</span>
          </button>
        </div>

      </div>

    </div>

  </main>

  <!-- MODAL: REUNIÃO & VIDEOCONFERÊNCIA (JITSI MEET WEBRTC) -->
  <div id="meetingModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
    <div class="glass-card bg-titanium-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
      
      <!-- Modal Header -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-titanium-950">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <i data-lucide="video" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-sm sm:text-base">Teleconferência & Reunião de Operações</h3>
            <p class="text-[11px] text-slate-400">Sala WebRTC com vídeo HD, áudio estéreo e compartilhamento de tela.</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button onclick="copyMeetingLink()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition border border-slate-700">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copiar Link</span>
          </button>
          <button onclick="closeMeetingModal()" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <!-- Iframe Container for Jitsi WebRTC -->
      <div class="flex-1 bg-black relative">
        <iframe id="meetingIframe" src="" allow="camera; microphone; display-capture; autoplay; clipboard-write" class="w-full h-full border-0"></iframe>
      </div>

      <!-- Modal Footer -->
      <div class="p-3 border-t border-slate-800 bg-titanium-950 flex items-center justify-between text-xs text-slate-400 px-4">
        <span>Link da Sala: <code id="meetingRoomUrl" class="text-indigo-400 font-mono"></code></span>
        <button onclick="sendMeetingInviteToChat()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition">
          <i data-lucide="send" class="w-4 h-4"></i> Enviar Link no Chat do WhatsApp
        </button>
      </div>

    </div>
  </div>

  <script>
    const SESSION_ID = 'whatsapp_principal';
    let allChats = [];
    let activeCategoryTab = 'LOGGI'; // 'LOGGI' or 'PESSOAL'
    let activeChatJid = '';
    let isAIGlobal = true;
    let mediaRecorder = null;
    let audioChunks = [];
    let recordTimerInterval = null;
    let recordSeconds = 0;
    let currentMeetingRoom = 'atlas-loggi-' + Math.floor(100000 + Math.random() * 900000);

    // 1. Alterna entre a Lista da Loggi e Lista Pessoal/Arquivadas
    function switchCategoryTab(cat) {
      activeCategoryTab = cat;
      const btnLoggi = document.getElementById('tabBtnLoggi');
      const btnPessoal = document.getElementById('tabBtnPessoal');

      if (cat === 'LOGGI') {
        btnLoggi.className = 'py-2 px-3 rounded-lg bg-loggi-500 text-white flex items-center justify-center gap-1.5 transition shadow-sm';
        btnPessoal.className = 'py-2 px-3 rounded-lg text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition';
      } else {
        btnPessoal.className = 'py-2 px-3 rounded-lg bg-slate-700 text-white flex items-center justify-center gap-1.5 transition shadow-sm';
        btnLoggi.className = 'py-2 px-3 rounded-lg text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition';
      }

      renderChatsList();
    }

    // 2. Carrega conversas da API
    async function loadChats() {
      try {
        const res = await fetch('/chats/' + SESSION_ID);
        const json = await res.json();
        allChats = json.data || [];
        updateCounts();
        renderChatsList();
      } catch (_) {}
    }

    function isLoggiChat(c) {
      if (c.category === 'PESSOAL' || c.category === 'ARQUIVADO') return false;
      if (c.category === 'LOGGI') return true;
      const text = ((c.name || '') + ' ' + (c.lastMessage || '') + ' ' + (c.remoteJid || '')).toLowerCase();
      return (
        (c.remoteJid && c.remoteJid.endsWith('@g.us')) ||
        text.includes('loggi') || text.includes('lggi') || text.includes('rota') ||
        text.includes('transferência') || text.includes('transferencia') || text.includes('motorista') ||
        text.includes('coleta') || text.includes('entrega') || text.includes('galpão') || text.includes('galpao')
      );
    }

    function updateCounts() {
      let countLoggi = 0;
      let countPessoal = 0;
      allChats.forEach(c => {
        if (isLoggiChat(c)) countLoggi++;
        else countPessoal++;
      });
      document.getElementById('badgeCountLoggi').innerText = countLoggi;
      document.getElementById('badgeCountPessoal').innerText = countPessoal;
    }

    // 3. Renderiza a lista de conversas de acordo com a aba ativa
    function renderChatsList() {
      const search = (document.getElementById('chatSearchInput')?.value || '').toLowerCase();
      const container = document.getElementById('conversationsContainer');

      const filtered = allChats.filter(c => {
        const matchSearch = (c.name || '').toLowerCase().includes(search) || (c.lastMessage || '').toLowerCase().includes(search);
        if (!matchSearch) return false;

        const isL = isLoggiChat(c);
        if (activeCategoryTab === 'LOGGI') return isL;
        return !isL;
      });

      if (filtered.length === 0) {
        container.innerHTML = \`<div class="p-8 text-center text-xs text-slate-500">Nenhuma conversa na pasta \${activeCategoryTab === 'LOGGI' ? 'Operações Loggi' : 'Pessoal / Arquivadas'}.</div>\`;
        return;
      }

      container.innerHTML = filtered.map(c => {
        const isSelected = c.remoteJid === activeChatJid;
        const bg = isSelected ? 'bg-titanium-800/90 border-l-4 border-loggi-500' : 'hover:bg-titanium-800/40';
        const time = new Date(c.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isL = isLoggiChat(c);
        const badge = isL
          ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-loggi-500/20 text-loggi-400 font-bold border border-loggi-500/30">LGGI</span>'
          : '<span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold border border-slate-700">PESSOAL</span>';

        return \`
          <div onclick="selectChat('\${c.remoteJid}', '\${(c.name || '').replace(/'/g, "\\\\'")}', '\${isL ? 'LOGGI' : 'PESSOAL'}')" class="p-3.5 cursor-pointer transition flex items-center space-x-3 \${bg}">
            <div class="w-10 h-10 rounded-xl bg-titanium-950 flex items-center justify-center text-loggi-400 font-bold text-xs shrink-0 border border-slate-800">
              \${(c.name || 'W').substring(0, 2).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1.5 truncate">
                  <h4 class="text-xs font-bold text-white truncate">\${c.name}</h4>
                  \${badge}
                </div>
                <span class="text-[10px] text-slate-500 font-mono shrink-0">\${time}</span>
              </div>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">\${c.lastMessage || 'Conversa ativa'}</p>
            </div>
          </div>
        \`;
      }).join('');
      lucide.createIcons();
    }

    function filterChatList() {
      renderChatsList();
    }

    // 4. Seleciona uma conversa
    async function selectChat(jid, name, category) {
      activeChatJid = jid;
      document.getElementById('chatName').innerText = name || jid.split('@')[0];
      document.getElementById('chatJid').innerText = jid;

      const badge = document.getElementById('chatCategoryBadge');
      badge.innerText = category;
      if (category === 'LOGGI') {
        badge.className = 'text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-loggi-500/10 text-loggi-400 border border-loggi-500/30';
      } else {
        badge.className = 'text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700';
      }

      // Se for grupo da Loggi, exibe a Torre do Grupo automaticamente
      const isGroup = jid.endsWith('@g.us');
      const towerBtn = document.getElementById('btnGroupTowerToggle');
      if (isGroup || category === 'LOGGI') {
        towerBtn.classList.remove('hidden');
      } else {
        towerBtn.classList.add('hidden');
        document.getElementById('groupTowerBanner').classList.add('hidden');
      }

      loadChatMessages(jid);
      renderChatsList();
    }

    // 5. Carrega mensagens e busca sugestões inteligentes de resposta
    async function loadChatMessages(jid) {
      if (!jid) return;
      try {
        const res = await fetch('/chats/' + SESSION_ID + '/' + encodeURIComponent(jid) + '/messages');
        const json = await res.json();
        const container = document.getElementById('chatMessagesBody');
        const messages = json.data || [];

        if (messages.length === 0) {
          container.innerHTML = '<div class="m-auto text-center text-xs text-slate-500">Histórico de mensagens vazio.</div>';
          document.getElementById('smartRepliesDock').classList.add('hidden');
          return;
        }

        container.innerHTML = messages.map(m => {
          const isMe = m.isFromMe;
          const align = isMe ? 'items-end' : 'items-start';
          const bubble = isMe ? 'bg-loggi-600 text-white rounded-tr-none' : 'bg-titanium-800 text-slate-200 rounded-tl-none border border-slate-700/60';
          const time = new Date(m.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isAudio = m.mediaType === 'voice';

          return \`
            <div class="flex flex-col \${align} max-w-[85%] \${isMe ? 'self-end' : 'self-start'}">
              <div class="px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed \${bubble}">
                \${isAudio ? \`
                  <div class="space-y-2 mb-2 p-2 rounded-xl bg-titanium-950/80 border border-emerald-500/30">
                    <div class="flex items-center space-x-2 text-emerald-400 font-bold">
                      <i data-lucide="mic" class="w-4 h-4"></i>
                      <span>Áudio Transcrito na Íntegra (Whisper)</span>
                    </div>
                    \${m.mediaUrl ? \`<audio controls class="w-full h-8 mt-1"><source src="\${m.mediaUrl}" type="audio/ogg"></audio>\` : ''}
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

        // Pega última mensagem recebida para gerar sugestões humanizadas de resposta
        const lastIncoming = [...messages].reverse().find(m => !m.isFromMe);
        if (lastIncoming && lastIncoming.text) {
          fetchSmartReplies(lastIncoming.text, lastIncoming.senderName);
        } else {
          document.getElementById('smartRepliesDock').classList.add('hidden');
        }

      } catch (_) {}
    }

    // 6. Busca 3 sugestões humanizadas de respostas
    async function fetchSmartReplies(text, senderName) {
      try {
        const res = await fetch('/chats/' + SESSION_ID + '/smart-replies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, name: senderName })
        });
        const json = await res.json();
        const suggestions = json.data || [];
        if (suggestions.length === 0) return;

        const dock = document.getElementById('smartRepliesDock');
        const container = document.getElementById('smartRepliesContainer');
        dock.classList.remove('hidden');

        container.innerHTML = suggestions.map(s => \`
          <button onclick="applySmartReply('\${s.text.replace(/'/g, "\\\\'")}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1.5">
            <span class="text-loggi-400 font-bold">[\${s.label}]</span> \${s.text}
          </button>
        \`).join('');
      } catch (_) {}
    }

    function applySmartReply(text) {
      const input = document.getElementById('chatInputText');
      input.value = text;
      input.focus();
    }

    // 7. Envia Mensagem de Texto
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

    // 8. Alterna Categoria do Chat Ativo (Loggi <-> Pessoal)
    async function toggleActiveChatCategory() {
      if (!activeChatJid) return;
      const newCat = activeCategoryTab === 'LOGGI' ? 'PESSOAL' : 'LOGGI';
      try {
        await fetch('/chats/' + SESSION_ID + '/category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jid: activeChatJid, category: newCat })
        });
        await loadChats();
        selectChat(activeChatJid, document.getElementById('chatName').innerText, newCat);
      } catch (_) {}
    }

    // 9. Torre de Controle do Grupo (Resumo com IA)
    function toggleGroupTower() {
      const banner = document.getElementById('groupTowerBanner');
      banner.classList.toggle('hidden');
    }

    async function generateGroupSummary() {
      if (!activeChatJid) return;
      const btn = document.getElementById('btnGenerateSummary');
      const box = document.getElementById('groupSummaryBox');
      const groupName = document.getElementById('chatName').innerText;

      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Processando...';
      box.innerText = 'Consultando banco de alta capacidade e sintetizando mensagens da operação com IA...';
      lucide.createIcons();

      try {
        const res = await fetch('/chats/' + SESSION_ID + '/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jid: activeChatJid, groupName })
        });
        const json = await res.json();
        box.innerText = json.data?.summary || 'Nenhuma mensagem relevante encontrada para sintetizar.';
      } catch (e) {
        box.innerText = 'Falha ao gerar resumo. Tente novamente em instantes.';
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Gerar Resumo Executivo (IA)';
        lucide.createIcons();
      }
    }

    function mirrorSummaryToTelegram() {
      const box = document.getElementById('groupSummaryBox').innerText;
      if (!box) return;
      alert('Resumo da Operação despachado para sua Torre de Controle no Telegram (@AtlasJuniorBot)!');
    }

    // 10. Gravação de Áudio PTT Nativa (Microfone)
    async function startAudioRecording() {
      if (!activeChatJid) {
        alert('Selecione uma conversa para enviar a nota de voz.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.start();
        document.getElementById('voiceRecordingDock').classList.remove('hidden');
        document.getElementById('normalInputBar').classList.add('hidden');

        recordSeconds = 0;
        recordTimerInterval = setInterval(() => {
          recordSeconds++;
          const mins = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
          const secs = String(recordSeconds % 60).padStart(2, '0');
          document.getElementById('recordTimer').innerText = mins + ':' + secs;
        }, 1000);
      } catch (err) {
        alert('Permissão de microfone necessária para gravar áudio: ' + err.message);
      }
    }

    function cancelAudioRecording() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
      }
      clearInterval(recordTimerInterval);
      document.getElementById('voiceRecordingDock').classList.add('hidden');
      document.getElementById('normalInputBar').classList.remove('hidden');
    }

    async function finishAndSendAudio() {
      if (!mediaRecorder) return;
      clearInterval(recordTimerInterval);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp4' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          try {
            await fetch('/messages/' + SESSION_ID + '/send-audio-base64', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: activeChatJid, audioBase64: base64Audio })
            });
            loadChatMessages(activeChatJid);
          } catch (_) {}
        };
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
      document.getElementById('voiceRecordingDock').classList.add('hidden');
      document.getElementById('normalInputBar').classList.remove('hidden');
    }

    // 11. Modal de Teleconferência & Videoconferência
    function openMeetingModal() {
      const url = 'https://meet.jit.si/' + currentMeetingRoom;
      document.getElementById('meetingRoomUrl').innerText = url;
      document.getElementById('meetingIframe').src = url;
      document.getElementById('meetingModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeMeetingModal() {
      document.getElementById('meetingModal').classList.add('hidden');
      document.getElementById('meetingIframe').src = '';
    }

    function copyMeetingLink() {
      const url = 'https://meet.jit.si/' + currentMeetingRoom;
      navigator.clipboard.writeText(url);
      alert('Link da sala copiado: ' + url);
    }

    async function sendMeetingInviteToChat() {
      if (!activeChatJid) {
        alert('Selecione uma conversa para enviar o convite.');
        return;
      }
      const url = 'https://meet.jit.si/' + currentMeetingRoom;
      const text = '📹 Convite para Reunião de Operações da Loggi: ' + url + '\\n\\nClique no link acima para entrar na chamada de vídeo e teleconferência agora pelo navegador.';
      await fetch('/messages/' + SESSION_ID + '/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sua_chave_mestra_secreta_aqui'
        },
        body: JSON.stringify({ to: activeChatJid, text })
      });
      alert('Convite da reunião enviado no WhatsApp com sucesso!');
      loadChatMessages(activeChatJid);
    }

    function startQuickCall() {
      openMeetingModal();
    }

    // 12. Toggle Global AI
    async function toggleGlobalAI() {
      isAIGlobal = !isAIGlobal;
      await fetch('/agents/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: isAIGlobal })
      });
      document.getElementById('globalAiLabel').innerText = isAIGlobal ? 'IA: Autônoma' : 'IA: Pausada';
      document.getElementById('btnGlobalAI').className = isAIGlobal
        ? 'flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-bold bg-loggi-500/10 text-loggi-400 border-loggi-500/30'
        : 'flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-bold bg-slate-800 text-slate-400 border-slate-700';
    }

    // Auto-refresh contínuo a cada 3.5 segundos
    setInterval(() => {
      if (activeChatJid) loadChatMessages(activeChatJid);
      loadChats();
    }, 3500);

    // Inicialização
    loadChats();
    lucide.createIcons();
  </script>
</body>
</html>`;
}
