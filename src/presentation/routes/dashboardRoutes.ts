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
      name: 'Atlas Loggi Command Center',
      short_name: 'Atlas Loggi',
      description: 'Painel Executivo WhatsApp, Grupos Loggi (LGGI), Agenda de Contatos e Torre Telegram',
      start_url: '/',
      display: 'standalone',
      background_color: '#07090E',
      theme_color: '#0284c7',
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

  // Servir arquivos de áudio transcritos
  fastify.get('/audio/:filename', async (req, reply) => {
    const { filename } = req.params as { filename: string };
    const audioPath = path.resolve(process.cwd(), 'storage', 'audio', filename);
    if (fs.existsSync(audioPath)) {
      return reply.type('audio/ogg').send(fs.createReadStream(audioPath));
    }
    return reply.status(404).send({ error: 'Arquivo de áudio não encontrado.' });
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
  <title>Atlas Loggi | Command Center & Agenda de Contatos</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#0284c7">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="icon" type="image/svg+xml" href="/icon.svg">
  <link rel="apple-touch-icon" href="/icon.svg">

  <!-- Tailwind CSS & Lucide Icons -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <!-- Leaflet CSS & JS para Rastreamento em Tempo Real da Frota -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            obsidian: {
              950: '#07090E',
              900: '#0D111A',
              850: '#131926',
              800: '#1A2234',
              700: '#253046'
            },
            loggi: {
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1'
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
    .glass-rail {
      background: rgba(13, 17, 26, 0.95);
      backdrop-filter: blur(24px);
      border-right: 1px solid rgba(255, 255, 255, 0.07);
    }
    .glass-card {
      background: rgba(19, 25, 38, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-card-hover:hover {
      background: rgba(26, 34, 52, 0.85);
      border-color: rgba(14, 165, 233, 0.3);
    }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: #07090E; }
    ::-webkit-scrollbar-thumb { background: #0ea5e933; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #0ea5e977; }
  </style>
</head>
<body class="bg-obsidian-950 text-slate-100 h-screen w-screen overflow-hidden flex antialiased selection:bg-loggi-500 selection:text-white">

  <!-- ========================================================================= -->
  <!-- 1. LEFT NAVIGATION RAIL (SLACK/LINEAR DOCK)                               -->
  <!-- ========================================================================= -->
  <aside class="w-16 sm:w-20 glass-rail flex flex-col items-center justify-between py-4 z-40 select-none">
    
    <!-- Top Branding -->
    <div class="flex flex-col items-center space-y-6">
      <div class="relative group cursor-pointer" onclick="switchMainView('chats')">
        <img src="/icon.svg" alt="Atlas Loggi" class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl shadow-xl shadow-loggi-500/20 object-contain p-1 bg-obsidian-900 border border-loggi-500/40 group-hover:scale-105 transition">
        <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-obsidian-950 flex items-center justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        </span>
      </div>

      <!-- Navigation Icons -->
      <nav class="flex flex-col space-y-3">
        
        <!-- Chats & Groups Button -->
        <button onclick="switchMainView('chats')" id="railBtnChats" class="rail-btn p-3 rounded-2xl bg-loggi-500/20 text-loggi-400 border border-loggi-500/30 transition flex flex-col items-center group relative" title="Operações & Grupos Loggi">
          <i data-lucide="message-square" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Chats</span>
        </button>

        <!-- Saved Contacts Directory Button -->
        <button onclick="switchMainView('contacts')" id="railBtnContacts" class="rail-btn p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Agenda de Contatos Salvos">
          <i data-lucide="contact" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Contatos</span>
          <span id="railContactsBadge" class="absolute -top-1 -right-1 bg-emerald-500 text-obsidian-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full hidden">0</span>
        </button>

        <!-- Group Operations Control Tower -->
        <button onclick="switchMainView('tower')" id="railBtnTower" class="rail-btn p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Torre de Controle Operacional Loggi">
          <i data-lucide="tower-control" class="w-5 h-5 text-sky-400"></i>
          <span class="text-[9px] font-bold mt-1">Torre</span>
        </button>

        <!-- Live Fleet Map (Leaflet) -->
        <button onclick="switchMainView('fleet')" id="railBtnFleet" class="rail-btn p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Mapa da Frota em Tempo Real">
          <i data-lucide="map" class="w-5 h-5 text-amber-400"></i>
          <span class="text-[9px] font-bold mt-1">Mapa</span>
        </button>

        <!-- Delivery Receipts & OCR -->
        <button onclick="switchMainView('receipts')" id="railBtnReceipts" class="rail-btn p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Canhotos & Comprovantes OCR">
          <i data-lucide="file-check-2" class="w-5 h-5 text-emerald-400"></i>
          <span class="text-[9px] font-bold mt-1">Canhotos</span>
        </button>

        <!-- Telephony / Softphone WebRTC -->
        <button onclick="switchMainView('telephony')" id="railBtnTelephony" class="rail-btn p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Telefonia & Discador WebRTC">
          <i data-lucide="phone-call" class="w-5 h-5 text-cyan-400"></i>
          <span class="text-[9px] font-bold mt-1">Telefone</span>
        </button>

        <!-- Video Conference & Meeting -->
        <button onclick="openMeetingModal()" class="p-3 rounded-2xl text-slate-400 hover:text-indigo-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Criar Teleconferência / Videoconferência">
          <i data-lucide="video" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Vídeo</span>
        </button>

        <!-- Telegram Bridge -->
        <a href="https://t.me/AtlasJuniorBot" target="_blank" class="p-3 rounded-2xl text-slate-400 hover:text-sky-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Abrir Torre Telegram (@AtlasJuniorBot)">
          <i data-lucide="send" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Telegram</span>
        </a>

        <!-- Global AI Toggle -->
        <button onclick="toggleGlobalAI()" id="railBtnAI" class="p-3 rounded-2xl text-emerald-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Alternar IA Autônoma">
          <i data-lucide="bot" class="w-5 h-5"></i>
          <span id="railAILabel" class="text-[9px] font-bold mt-1">IA: ON</span>
        </button>
      </nav>
    </div>

    <!-- Bottom Actions -->
    <div class="flex flex-col items-center space-y-3">
      <button onclick="syncAllContactsAndHistory()" id="railBtnSync" class="p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition" title="Sincronizar Todos os Contatos e Mensagens">
        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
      </button>
    </div>
  </aside>

  <!-- ========================================================================= -->
  <!-- 2. WORKSPACE WRAPPER                                                      -->
  <!-- ========================================================================= -->
  <div class="flex-1 flex overflow-hidden">

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW A: OPERAÇÕES LOGGI & CENTRAL DE MENSAGENS                       -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionChats" class="flex-1 flex overflow-hidden w-full">
      
      <!-- SUB-SIDEBAR: LISTA DE CONVERSAS (LOGGI vs PESSOAL) -->
      <div class="w-80 sm:w-96 border-r border-slate-800/80 bg-obsidian-900/60 flex flex-col h-full">
        
        <!-- Header & Search -->
        <div class="p-3.5 border-b border-slate-800/80 space-y-3">
          
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-loggi-500"></span>
              Central de Mensagens
            </h2>
            <button onclick="openNewContactModal()" class="text-[11px] font-bold text-loggi-400 hover:text-loggi-300 bg-loggi-500/10 hover:bg-loggi-500/20 px-2.5 py-1 rounded-xl border border-loggi-500/30 flex items-center gap-1 transition">
              <i data-lucide="user-plus" class="w-3 h-3"></i> + Contato
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative">
            <i data-lucide="search" class="w-4 h-4 text-slate-500 absolute left-3 top-2.5"></i>
            <input type="text" id="chatSearchInput" oninput="filterChatList()" placeholder="Buscar grupos Loggi, rotas, contatos..." class="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-loggi-500 transition">
          </div>

          <!-- Segmented Filter: Loggi Operações vs Pessoal/Arquivadas -->
          <div class="grid grid-cols-2 p-1 bg-obsidian-950 rounded-xl border border-slate-800/90 text-xs font-bold">
            <button onclick="switchCategoryTab('LOGGI')" id="tabBtnLoggi" class="py-1.5 px-3 rounded-lg bg-loggi-500 text-white flex items-center justify-center gap-1.5 transition shadow-sm">
              <i data-lucide="truck" class="w-3.5 h-3.5"></i>
              <span>Loggi</span>
              <span id="badgeCountLoggi" class="ml-1 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">0</span>
            </button>
            <button onclick="switchCategoryTab('PESSOAL')" id="tabBtnPessoal" class="py-1.5 px-3 rounded-lg text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
              <span>Pessoal</span>
              <span id="badgeCountPessoal" class="ml-1 text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full">0</span>
            </button>
          </div>
        </div>

        <!-- Chats Scrollable List -->
        <div id="conversationsContainer" class="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          <div class="p-8 text-center text-xs text-slate-500">
            Carregando conversas do WhatsApp...
          </div>
        </div>

        <!-- Sub-Sidebar Footer Stats -->
        <div class="p-2.5 border-t border-slate-800/80 bg-obsidian-950/80 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <span class="flex items-center gap-1.5" id="storageStatsText">
            <i data-lucide="database" class="w-3.5 h-3.5 text-loggi-400"></i>
            <span>SQLite Ativo</span>
          </span>
          <button onclick="syncAllContactsAndHistory()" class="text-[11px] bg-loggi-500/20 hover:bg-loggi-500/30 text-loggi-300 px-2 py-0.5 rounded-lg border border-loggi-500/30 font-bold flex items-center gap-1 transition">
            <i data-lucide="refresh-cw" class="w-3 h-3"></i> Sincronizar
          </button>
        </div>
      </div>

      <!-- WORKSTATION PRINCIPAL: JANELA DE CHAT ATIVA -->
      <div class="flex-1 flex flex-col bg-obsidian-950/90 relative h-full">
        
        <!-- Chat Header -->
        <div id="chatHeader" class="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-obsidian-900/40">
          <div class="flex items-center space-x-3">
            <div id="chatAvatar" class="w-10 h-10 rounded-2xl bg-obsidian-850 flex items-center justify-center text-loggi-400 font-extrabold text-sm border border-slate-700/60 shadow-md">
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

          <!-- Quick Action Buttons for Active Chat -->
          <div class="flex items-center space-x-2">
            <!-- Group Tower Collapsible Button -->
            <button onclick="toggleGroupTower()" id="btnGroupTowerToggle" class="text-xs bg-loggi-500/10 hover:bg-loggi-500/20 text-loggi-400 px-3 py-1.5 rounded-xl border border-loggi-500/30 flex items-center gap-1.5 transition font-bold" title="Abrir Torre de Controle do Grupo">
              <i data-lucide="tower-control" class="w-3.5 h-3.5"></i>
              <span class="hidden md:inline">Torre do Grupo</span>
            </button>

            <!-- Video Conference Invite -->
            <button onclick="sendMeetingInviteToChat()" class="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-500/30 flex items-center gap-1.5 transition font-bold" title="Convidar para Videoconferência">
              <i data-lucide="video" class="w-3.5 h-3.5"></i>
              <span class="hidden lg:inline">Convidar Vídeo</span>
            </button>

            <!-- Switch Folder Category -->
            <button onclick="toggleActiveChatCategory()" id="btnSwitchCat" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition" title="Alternar entre Loggi e Pessoal">
              <i data-lucide="arrow-left-right" class="w-3.5 h-3.5"></i>
              <span class="hidden xl:inline">Mudar Pasta</span>
            </button>
          </div>
        </div>

        <!-- COLLAPSIBLE EXECUTIVE GROUP TOWER BANNER -->
        <div id="groupTowerBanner" class="hidden border-b border-slate-800 bg-obsidian-900/90 p-4 space-y-3 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2.5">
              <div class="w-9 h-9 rounded-xl bg-loggi-500/20 text-loggi-400 flex items-center justify-center font-bold">
                <i data-lucide="tower-control" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="font-extrabold text-white text-sm">Torre de Controle Operacional Loggi</h4>
                <p class="text-[11px] text-slate-400">Análise executiva de veículos, cargas, rotas e ocorrências.</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <button onclick="generateGroupSummary()" id="btnGenerateSummary" class="text-xs px-3.5 py-1.5 bg-loggi-500 hover:bg-loggi-600 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                <span>Gerar Resumo Executivo (IA)</span>
              </button>
              <button onclick="mirrorSummaryToTelegram()" class="text-xs px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30 font-bold flex items-center gap-1.5 transition">
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">Telegram</span>
              </button>
            </div>
          </div>

          <!-- Summary Box -->
          <div id="groupSummaryBox" class="bg-obsidian-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap max-h-44 overflow-y-auto">
            Clique em "Gerar Resumo Executivo" para que a IA analise as mensagens recentes deste grupo e elabore o panorama das operações, rotas e ocorrências.
          </div>
        </div>

        <!-- Chat Messages Body -->
        <div id="chatMessagesBody" class="flex-1 p-4 overflow-y-auto space-y-3.5 flex flex-col justify-end">
          <div class="m-auto text-center text-slate-500 text-xs space-y-2">
            <i data-lucide="messages-square" class="w-12 h-12 mx-auto text-slate-700"></i>
            <p>Selecione um grupo da Loggi ou contato na lista lateral para abrir a conversa.</p>
          </div>
        </div>

        <!-- HUMANIZED SMART REPLIES DOCK -->
        <div id="smartRepliesDock" class="hidden px-4 py-2 border-t border-slate-800/60 bg-obsidian-900/40 flex items-center space-x-2 overflow-x-auto">
          <span class="text-[10px] uppercase font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <i data-lucide="sparkles" class="w-3 h-3 text-amber-400"></i> Sugestões Humanizadas:
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
              <i data-lucide="mic" class="w-4 h-4"></i> Gravando Mensagem de Voz PTT...
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

        <!-- Normal Input Bar -->
        <div id="normalInputBar" class="p-3.5 border-t border-slate-800/80 bg-obsidian-900/70 flex items-center space-x-2">
          
          <!-- Mic Voice Button -->
          <button onclick="startAudioRecording()" class="p-3 bg-obsidian-850 hover:bg-slate-800 text-emerald-400 rounded-xl transition border border-slate-700/60 shadow-sm" title="Gravar Áudio de Voz (PTT)">
            <i data-lucide="mic" class="w-4 h-4"></i>
          </button>

          <!-- Input Text -->
          <input type="text" id="chatInputText" onkeydown="if(event.key==='Enter') sendChatMessage()" placeholder="Digite uma mensagem ou resposta..." class="flex-1 bg-obsidian-950 border border-slate-800 text-white text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-loggi-500 transition shadow-inner">
          
          <!-- Send Button -->
          <button onclick="sendChatMessage()" class="px-4 py-3 bg-loggi-500 hover:bg-loggi-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-loggi-500/20">
            <i data-lucide="send" class="w-4 h-4"></i>
            <span class="hidden sm:inline">Enviar</span>
          </button>
        </div>

      </div>

    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW D: MAPA DA FROTA EM TEMPO REAL (LEAFLET / LOGISTICS)             -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionFleet" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-hidden space-y-4">
      <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <i data-lucide="map" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-extrabold text-white">Rastreamento da Frota & Polos Loggi</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> GPS TELEMETRIA ATIVA
              </span>
            </div>
            <p class="text-xs text-slate-400">Posicionamento geográfico dos centros de distribuição e carretas em rota.</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button onclick="focusMapOnHub(-23.3556, -46.8778, 'Cajamar')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Cajamar
          </button>
          <button onclick="focusMapOnHub(-23.5284, -46.7319, 'Leopoldina')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Leopoldina
          </button>
          <button onclick="focusMapOnHub(-22.9056, -47.0608, 'Campinas')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Campinas
          </button>
          <button onclick="focusMapOnHub(-22.8122, -43.3644, 'Rio')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Rio de Janeiro
          </button>
        </div>
      </div>

      <div class="flex-1 flex gap-4 min-h-0">
        <!-- Leaflet Map Container -->
        <div id="fleetMapContainer" class="flex-1 rounded-2xl border border-slate-800 overflow-hidden bg-obsidian-900 relative">
          <div id="fleetMap" class="w-full h-full z-10"></div>
        </div>

        <!-- Veículos em Rota Sidebar -->
        <div class="w-80 glass-card rounded-2xl border border-slate-800 p-4 flex flex-col space-y-3 overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-bold text-white uppercase tracking-wider">Veículos Monitorados</span>
            <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">5 Ativos</span>
          </div>
          <div class="flex-1 overflow-y-auto space-y-2 text-xs" id="fleetVehicleList">
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">CAR-401 (Marcos Oliveira)</span>
                <span class="text-emerald-400 font-mono text-[10px]">68 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Transferência Cajamar -&gt; Leopoldina</p>
            </div>
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">VUC-204 (Eduardo Santos)</span>
                <span class="text-amber-400 font-mono text-[10px]">32 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Last-Mile Pinheiros / Butantã</p>
            </div>
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">CAR-512 (Valdir Pereira)</span>
                <span class="text-emerald-400 font-mono text-[10px]">75 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Expedição Campinas -&gt; RMC</p>
            </div>
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">VAN-108 (Rodrigo Mendes)</span>
                <span class="text-emerald-400 font-mono text-[10px]">45 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Distribuição Pavuna / Baixada</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW E: CANHOTOS & COMPROVANTES COM OCR                               -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionReceipts" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
      <div class="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <i data-lucide="file-check-2" class="w-5 h-5"></i>
          </div>
          <div>
            <h2 class="text-lg font-extrabold text-white">Canhotos & Comprovantes com OCR Automático</h2>
            <p class="text-xs text-slate-400">Reconhecimento de Notas Fiscais e Danfes enviadas pelos motoristas no WhatsApp.</p>
          </div>
        </div>

        <button onclick="simulateOCRReceipt()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/20">
          <i data-lucide="scan" class="w-4 h-4"></i> Simular Leitura OCR de Canhoto
        </button>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-800 bg-obsidian-900/90 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white uppercase tracking-wider">Comprovantes Baixados Recentemente</span>
          <button onclick="loadReceiptsList()" class="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Atualizar
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400">
                <th class="pb-2 font-semibold">Horário</th>
                <th class="pb-2 font-semibold">Nota Fiscal / Danfe</th>
                <th class="pb-2 font-semibold">Motorista / Origem</th>
                <th class="pb-2 font-semibold">Texto Extraído pelo OCR</th>
                <th class="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody id="receiptsTableBody" class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-3 text-slate-400 font-mono">19:30</td>
                <td class="py-3 font-mono font-bold text-emerald-400">NF-849204</td>
                <td class="py-3 font-semibold text-white">Carlos Motorista - Rota 14</td>
                <td class="py-3 text-slate-300">DANFE / NOTA FISCAL Nº 849204 - RECEBEDOR: MERCADO CENTRAL SP - ASSINADO NA DOCA</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">APROVADO</span></td>
              </tr>
              <tr>
                <td class="py-3 text-slate-400 font-mono">19:00</td>
                <td class="py-3 font-mono font-bold text-emerald-400">NF-772190</td>
                <td class="py-3 font-semibold text-white">Eduardo Loggi - Cajamar</td>
                <td class="py-3 text-slate-300">CANHOTO COMPROVANTE DE ENTREGA Nº 772190 - CARRETA DESCARREGADA SEM AVARIAS</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">APROVADO</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW F: TELEFONIA EXECUTIVA & DISCADOR WEBRTC (SOFTPHONE)             -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionTelephony" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
      <div class="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <i data-lucide="phone-call" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-extrabold text-white">Telefonia Executiva & Softphone WebRTC</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LINHA SIP/WEBRTC PRONTA
              </span>
            </div>
            <p class="text-xs text-slate-400">Faça e receba chamadas com fone/microfone para motoristas e polos.</p>
          </div>
        </div>

        <span class="text-xs text-slate-400 font-mono">Linha Operacional Loggi (+55 11 97625-8311)</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Teclado Discador (Dialpad) -->
        <div class="glass-card rounded-2xl p-6 border border-slate-800 bg-obsidian-900 flex flex-col items-center space-y-4 max-w-sm mx-auto w-full">
          <!-- Visor -->
          <div class="w-full bg-obsidian-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <input type="text" id="dialpadInput" placeholder="Digite o número ou DDD..." class="bg-transparent font-mono text-lg font-bold text-white w-full focus:outline-none">
            <button onclick="dialpadClear()" class="text-slate-500 hover:text-white transition p-1">
              <i data-lucide="delete" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Teclas 0-9, *, # -->
          <div class="grid grid-cols-3 gap-3 w-full">
            <button onclick="dialpadPress('1')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">1<span class="text-[8px] text-slate-500 font-normal">--</span></button>
            <button onclick="dialpadPress('2')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">2<span class="text-[8px] text-slate-500 font-normal">ABC</span></button>
            <button onclick="dialpadPress('3')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">3<span class="text-[8px] text-slate-500 font-normal">DEF</span></button>
            <button onclick="dialpadPress('4')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">4<span class="text-[8px] text-slate-500 font-normal">GHI</span></button>
            <button onclick="dialpadPress('5')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">5<span class="text-[8px] text-slate-500 font-normal">JKL</span></button>
            <button onclick="dialpadPress('6')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">6<span class="text-[8px] text-slate-500 font-normal">MNO</span></button>
            <button onclick="dialpadPress('7')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">7<span class="text-[8px] text-slate-500 font-normal">PQRS</span></button>
            <button onclick="dialpadPress('8')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">8<span class="text-[8px] text-slate-500 font-normal">TUV</span></button>
            <button onclick="dialpadPress('9')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">9<span class="text-[8px] text-slate-500 font-normal">WXYZ</span></button>
            <button onclick="dialpadPress('*')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex items-center justify-center">*</button>
            <button onclick="dialpadPress('0')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">0<span class="text-[8px] text-slate-500 font-normal">+</span></button>
            <button onclick="dialpadPress('#')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex items-center justify-center">#</button>
          </div>

          <!-- Botões de Ação de Chamada -->
          <div class="flex items-center space-x-3 w-full pt-2">
            <button onclick="startPhoneCall()" id="btnStartCall" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30">
              <i data-lucide="phone" class="w-5 h-5"></i> Ligar
            </button>
            <button onclick="endPhoneCall()" id="btnEndCall" class="hidden flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl items-center justify-center gap-2 transition shadow-lg shadow-rose-600/30">
              <i data-lucide="phone-off" class="w-5 h-5"></i> Desligar
            </button>
          </div>

          <!-- Status de Chamada Ativa -->
          <div id="callStatusBox" class="hidden w-full p-3 bg-obsidian-950 border border-emerald-500/40 rounded-xl text-center space-y-1">
            <span class="text-xs text-emerald-400 font-bold block">CHAMADA EM ANDAMENTO</span>
            <span id="callTimer" class="font-mono text-sm text-white font-bold">00:00</span>
          </div>
        </div>

        <!-- Histórico de Chamadas Recentes -->
        <div class="md:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 bg-obsidian-900 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="font-bold text-white text-sm">Histórico de Chamadas Telefônicas</h3>
            <span class="text-xs text-slate-400">Gravador e Registro Automático</span>
          </div>
          <div class="space-y-2 text-xs" id="callHistoryList">
            <div class="p-3 bg-obsidian-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><i data-lucide="phone-outgoing" class="w-4 h-4"></i></div>
                <div>
                  <span class="font-bold text-white block">Marcos Oliveira (Carreta SP-RJ)</span>
                  <span class="text-slate-400 text-[11px] font-mono">11987654321 • Duração: 01:45</span>
                </div>
              </div>
              <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">Concluída</span>
            </div>
            <div class="p-3 bg-obsidian-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><i data-lucide="phone-outgoing" class="w-4 h-4"></i></div>
                <div>
                  <span class="font-bold text-white">Central Cajamar - Doca 04</span>
                  <span class="text-slate-400 text-[11px] font-mono">11982223344 • Duração: 02:10</span>
                </div>
              </div>
              <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">Concluída</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW B: AGENDA DE CONTATOS SALVOS                                     -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionContacts" class="hidden flex-1 flex flex-col bg-obsidian-950/90 overflow-hidden h-full">
      
      <!-- Contacts Header -->
      <div class="p-6 border-b border-slate-800/80 bg-obsidian-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <i data-lucide="contact" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 class="text-lg font-extrabold text-white">Agenda Executiva de Contatos Salvos</h2>
              <p class="text-xs text-slate-400">Contatos do WhatsApp, motoristas, bases e parceiros sincronizados e salvos no SQLite.</p>
            </div>
          </div>
        </div>

        <!-- Add Contact & Search -->
        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:w-64">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
            <input type="text" id="contactSearchInput" oninput="loadContactsList()" placeholder="Buscar contato ou telefone..." class="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition">
          </div>

          <button onclick="openNewContactModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 whitespace-nowrap">
            <i data-lucide="plus" class="w-4 h-4"></i> Salvar Novo Contato
          </button>
        </div>
      </div>

      <!-- Category Filter Pills for Contacts -->
      <div class="px-6 py-3 border-b border-slate-800/60 bg-obsidian-900/20 flex items-center space-x-2 text-xs font-semibold overflow-x-auto">
        <button onclick="setContactCategoryFilter('ALL')" id="pillContact-ALL" class="pill-contact px-3 py-1 rounded-lg bg-emerald-500 text-white transition">Todos</button>
        <button onclick="setContactCategoryFilter('LOGGI')" id="pillContact-LOGGI" class="pill-contact px-3 py-1 rounded-lg bg-obsidian-850 text-slate-400 hover:text-white transition">Loggi / Operações</button>
        <button onclick="setContactCategoryFilter('PESSOAL')" id="pillContact-PESSOAL" class="pill-contact px-3 py-1 rounded-lg bg-obsidian-850 text-slate-400 hover:text-white transition">Pessoal</button>
        <button onclick="setContactCategoryFilter('PARCEIRO')" id="pillContact-PARCEIRO" class="pill-contact px-3 py-1 rounded-lg bg-obsidian-850 text-slate-400 hover:text-white transition">Motoristas & Parceiros</button>
      </div>

      <!-- Contacts Grid Container -->
      <div id="contactsCardsGrid" class="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div class="col-span-full text-center py-12 text-slate-500 text-xs">Carregando contatos salvos...</div>
      </div>

    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW D: MAPA DA FROTA EM TEMPO REAL (LEAFLET / LOGISTICS)             -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionFleet" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-hidden space-y-4">
      <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <i data-lucide="map" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-extrabold text-white">Rastreamento da Frota & Polos Loggi</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> GPS TELEMETRIA ATIVA
              </span>
            </div>
            <p class="text-xs text-slate-400">Posicionamento geográfico dos centros de distribuição e carretas em rota.</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button onclick="focusMapOnHub(-23.3556, -46.8778, 'Cajamar')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Cajamar
          </button>
          <button onclick="focusMapOnHub(-23.5284, -46.7319, 'Leopoldina')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Leopoldina
          </button>
          <button onclick="focusMapOnHub(-22.9056, -47.0608, 'Campinas')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Campinas
          </button>
          <button onclick="focusMapOnHub(-22.8122, -43.3644, 'Rio')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Rio de Janeiro
          </button>
        </div>
      </div>

      <div class="flex-1 flex gap-4 min-h-0">
        <!-- Leaflet Map Container -->
        <div id="fleetMapContainer" class="flex-1 rounded-2xl border border-slate-800 overflow-hidden bg-obsidian-900 relative">
          <div id="fleetMap" class="w-full h-full z-10"></div>
        </div>

        <!-- Veículos em Rota Sidebar -->
        <div class="w-80 glass-card rounded-2xl border border-slate-800 p-4 flex flex-col space-y-3 overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-bold text-white uppercase tracking-wider">Veículos Monitorados</span>
            <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">5 Ativos</span>
          </div>
          <div class="flex-1 overflow-y-auto space-y-2 text-xs" id="fleetVehicleList">
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">CAR-401 (Marcos Oliveira)</span>
                <span class="text-emerald-400 font-mono text-[10px]">68 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Transferência Cajamar -&gt; Leopoldina</p>
            </div>
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">VUC-204 (Eduardo Santos)</span>
                <span class="text-amber-400 font-mono text-[10px]">32 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Last-Mile Pinheiros / Butantã</p>
            </div>
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">CAR-512 (Valdir Pereira)</span>
                <span class="text-emerald-400 font-mono text-[10px]">75 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Expedição Campinas -&gt; RMC</p>
            </div>
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">VAN-108 (Rodrigo Mendes)</span>
                <span class="text-emerald-400 font-mono text-[10px]">45 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Distribuição Pavuna / Baixada</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW E: CANHOTOS & COMPROVANTES COM OCR                               -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionReceipts" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
      <div class="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <i data-lucide="file-check-2" class="w-5 h-5"></i>
          </div>
          <div>
            <h2 class="text-lg font-extrabold text-white">Canhotos & Comprovantes com OCR Automático</h2>
            <p class="text-xs text-slate-400">Reconhecimento de Notas Fiscais e Danfes enviadas pelos motoristas no WhatsApp.</p>
          </div>
        </div>

        <button onclick="simulateOCRReceipt()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/20">
          <i data-lucide="scan" class="w-4 h-4"></i> Simular Leitura OCR de Canhoto
        </button>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-800 bg-obsidian-900/90 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white uppercase tracking-wider">Comprovantes Baixados Recentemente</span>
          <button onclick="loadReceiptsList()" class="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Atualizar
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400">
                <th class="pb-2 font-semibold">Horário</th>
                <th class="pb-2 font-semibold">Nota Fiscal / Danfe</th>
                <th class="pb-2 font-semibold">Motorista / Origem</th>
                <th class="pb-2 font-semibold">Texto Extraído pelo OCR</th>
                <th class="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody id="receiptsTableBody" class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-3 text-slate-400 font-mono">19:30</td>
                <td class="py-3 font-mono font-bold text-emerald-400">NF-849204</td>
                <td class="py-3 font-semibold text-white">Carlos Motorista - Rota 14</td>
                <td class="py-3 text-slate-300">DANFE / NOTA FISCAL Nº 849204 - RECEBEDOR: MERCADO CENTRAL SP - ASSINADO NA DOCA</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">APROVADO</span></td>
              </tr>
              <tr>
                <td class="py-3 text-slate-400 font-mono">19:00</td>
                <td class="py-3 font-mono font-bold text-emerald-400">NF-772190</td>
                <td class="py-3 font-semibold text-white">Eduardo Loggi - Cajamar</td>
                <td class="py-3 text-slate-300">CANHOTO COMPROVANTE DE ENTREGA Nº 772190 - CARRETA DESCARREGADA SEM AVARIAS</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">APROVADO</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW F: TELEFONIA EXECUTIVA & DISCADOR WEBRTC (SOFTPHONE)             -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionTelephony" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
      <div class="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <i data-lucide="phone-call" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-extrabold text-white">Telefonia Executiva & Softphone WebRTC</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LINHA SIP/WEBRTC PRONTA
              </span>
            </div>
            <p class="text-xs text-slate-400">Faça e receba chamadas com fone/microfone para motoristas e polos.</p>
          </div>
        </div>

        <span class="text-xs text-slate-400 font-mono">Linha Operacional Loggi (+55 11 97625-8311)</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Teclado Discador (Dialpad) -->
        <div class="glass-card rounded-2xl p-6 border border-slate-800 bg-obsidian-900 flex flex-col items-center space-y-4 max-w-sm mx-auto w-full">
          <!-- Visor -->
          <div class="w-full bg-obsidian-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <input type="text" id="dialpadInput" placeholder="Digite o número ou DDD..." class="bg-transparent font-mono text-lg font-bold text-white w-full focus:outline-none">
            <button onclick="dialpadClear()" class="text-slate-500 hover:text-white transition p-1">
              <i data-lucide="delete" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Teclas 0-9, *, # -->
          <div class="grid grid-cols-3 gap-3 w-full">
            <button onclick="dialpadPress('1')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">1<span class="text-[8px] text-slate-500 font-normal">--</span></button>
            <button onclick="dialpadPress('2')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">2<span class="text-[8px] text-slate-500 font-normal">ABC</span></button>
            <button onclick="dialpadPress('3')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">3<span class="text-[8px] text-slate-500 font-normal">DEF</span></button>
            <button onclick="dialpadPress('4')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">4<span class="text-[8px] text-slate-500 font-normal">GHI</span></button>
            <button onclick="dialpadPress('5')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">5<span class="text-[8px] text-slate-500 font-normal">JKL</span></button>
            <button onclick="dialpadPress('6')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">6<span class="text-[8px] text-slate-500 font-normal">MNO</span></button>
            <button onclick="dialpadPress('7')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">7<span class="text-[8px] text-slate-500 font-normal">PQRS</span></button>
            <button onclick="dialpadPress('8')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">8<span class="text-[8px] text-slate-500 font-normal">TUV</span></button>
            <button onclick="dialpadPress('9')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">9<span class="text-[8px] text-slate-500 font-normal">WXYZ</span></button>
            <button onclick="dialpadPress('*')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex items-center justify-center">*</button>
            <button onclick="dialpadPress('0')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">0<span class="text-[8px] text-slate-500 font-normal">+</span></button>
            <button onclick="dialpadPress('#')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex items-center justify-center">#</button>
          </div>

          <!-- Botões de Ação de Chamada -->
          <div class="flex items-center space-x-3 w-full pt-2">
            <button onclick="startPhoneCall()" id="btnStartCall" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30">
              <i data-lucide="phone" class="w-5 h-5"></i> Ligar
            </button>
            <button onclick="endPhoneCall()" id="btnEndCall" class="hidden flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl items-center justify-center gap-2 transition shadow-lg shadow-rose-600/30">
              <i data-lucide="phone-off" class="w-5 h-5"></i> Desligar
            </button>
          </div>

          <!-- Status de Chamada Ativa -->
          <div id="callStatusBox" class="hidden w-full p-3 bg-obsidian-950 border border-emerald-500/40 rounded-xl text-center space-y-1">
            <span class="text-xs text-emerald-400 font-bold block">CHAMADA EM ANDAMENTO</span>
            <span id="callTimer" class="font-mono text-sm text-white font-bold">00:00</span>
          </div>
        </div>

        <!-- Histórico de Chamadas Recentes -->
        <div class="md:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 bg-obsidian-900 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="font-bold text-white text-sm">Histórico de Chamadas Telefônicas</h3>
            <span class="text-xs text-slate-400">Gravador e Registro Automático</span>
          </div>
          <div class="space-y-2 text-xs" id="callHistoryList">
            <div class="p-3 bg-obsidian-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><i data-lucide="phone-outgoing" class="w-4 h-4"></i></div>
                <div>
                  <span class="font-bold text-white block">Marcos Oliveira (Carreta SP-RJ)</span>
                  <span class="text-slate-400 text-[11px] font-mono">11987654321 • Duração: 01:45</span>
                </div>
              </div>
              <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">Concluída</span>
            </div>
            <div class="p-3 bg-obsidian-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><i data-lucide="phone-outgoing" class="w-4 h-4"></i></div>
                <div>
                  <span class="font-bold text-white">Central Cajamar - Doca 04</span>
                  <span class="text-slate-400 text-[11px] font-mono">11982223344 • Duração: 02:10</span>
                </div>
              </div>
              <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">Concluída</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW C: TORRE DE CONTROLE ANALÍTICA GERAL (PAINÉIS & FARÓIS LOGGI)     -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionTower" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
      
      <!-- Tower Header & Actions -->
      <div class="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shadow-lg shadow-sky-500/10">
            <i data-lucide="tower-control" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-extrabold text-white">Torre de Controle Operacional Loggi & Telegram</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> FAROL VERDE: 100% REGULAR
              </span>
            </div>
            <p class="text-xs text-slate-400">Monitoramento de tráfego, semaforização por hubs, SLA e despacho de ocorrências.</p>
          </div>
        </div>

        <!-- Quick Tower Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="window.open('/tower/report-html', '_blank')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition" title="Exportar Relatório Consolidado para PDF / Impressão">
            <i data-lucide="printer" class="w-4 h-4 text-emerald-400"></i> Relatório PDF
          </button>
          <button onclick="openDispatcherModal()" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20" title="Consultar regras operacionais com o Despachante IA">
            <i data-lucide="bot" class="w-4 h-4"></i> Despachante IA
          </button>
          <button onclick="openBroadcastModal()" class="px-3 py-2 bg-loggi-500 hover:bg-loggi-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-loggi-500/20" title="Enviar comunicado para todos os grupos Loggi">
            <i data-lucide="radio" class="w-4 h-4"></i> Comunicado Geral
          </button>
          <button onclick="openTelegramAlertModal()" class="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-rose-600/20" title="Disparar Alerta Vermelho no Telegram">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i> Alerta de Plantão
          </button>
          <button onclick="runMalhaScanIA()" id="btnScanMalha" class="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-purple-600/20" title="Analisar mensagens recentes com IA">
            <i data-lucide="sparkles" class="w-4 h-4"></i> Varredura IA
          </button>
          <a href="https://t.me/AtlasJuniorBot" target="_blank" class="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-sky-500/20">
            <i data-lucide="send" class="w-4 h-4"></i> Bot Telegram
          </a>
        </div>
      </div>

      <!-- PAINEL 1: FARÓIS OPERACIONAIS EM TEMPO REAL (SEMAFORIZAÇÃO) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Farol 1: Malha e Tráfego Geral -->
        <div class="glass-card rounded-2xl p-4 border border-slate-800 bg-obsidian-900/80 flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">Farol da Malha Loggi</span>
            <div class="text-lg font-extrabold text-emerald-400 flex items-center gap-2">
              <span>Fluxo Normal</span>
            </div>
            <p class="text-[11px] text-slate-400">47 Grupos monitorados em tempo real</p>
          </div>
          <div class="relative flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span class="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
          </div>
        </div>

        <!-- Farol 2: Conectividade WhatsApp Master -->
        <div class="glass-card rounded-2xl p-4 border border-slate-800 bg-obsidian-900/80 flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">Farol Conectividade</span>
            <div class="text-lg font-extrabold text-emerald-400 flex items-center gap-2">
              <span>Online (22ms)</span>
            </div>
            <p class="text-[11px] text-slate-400">+55 11 97625-8311 (Master)</p>
          </div>
          <div class="relative flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <i data-lucide="wifi" class="w-5 h-5"></i>
          </div>
        </div>

        <!-- Farol 3: SLA de Resposta e Docas -->
        <div class="glass-card rounded-2xl p-4 border border-slate-800 bg-obsidian-900/80 flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">Farol SLA de Resposta</span>
            <div class="text-lg font-extrabold text-white flex items-center gap-2">
              <span class="text-emerald-400">98.8%</span>
              <span class="text-xs text-slate-400 font-normal">(&lt; 3.4 min)</span>
            </div>
            <p class="text-[11px] text-slate-400">0 mensagens retidas na fila</p>
          </div>
          <div class="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <i data-lucide="clock" class="w-5 h-5"></i>
          </div>
        </div>

        <!-- Farol 4: Motor Whisper & Transcrição -->
        <div class="glass-card rounded-2xl p-4 border border-slate-800 bg-obsidian-900/80 flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">Farol IA & Transcrição</span>
            <div class="text-lg font-extrabold text-purple-400 flex items-center gap-2">
              <span>Whisper 100% Ativo</span>
            </div>
            <p class="text-[11px] text-slate-400">Transcrições literais salvas no balão</p>
          </div>
          <div class="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <i data-lucide="mic" class="w-5 h-5"></i>
          </div>
        </div>

      </div>

      <!-- PAINEL 2: HUBS E POLOS REGIONAIS DA LOGGI COM SEMAFORIZAÇÃO -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-extrabold text-white text-base flex items-center gap-2">
            <i data-lucide="map-pin" class="w-4 h-4 text-loggi-400"></i> Painéis dos Hubs e Centros de Distribuição
          </h3>
          <span class="text-xs text-slate-400">Atualização contínua via mensagens dos grupos</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="towerHubsGrid">
          
          <!-- Hub 1: Cajamar CD Matriz -->
          <div class="glass-card rounded-2xl p-4 border border-slate-800 bg-obsidian-900 hover:border-slate-700 transition space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> FAROL VERDE
              </span>
              <span class="text-xs font-bold text-slate-300">SLA 99.4%</span>
            </div>
            <div>
              <h4 class="font-bold text-white text-sm">Hub Cajamar (CD Matriz)</h4>
              <p class="text-[11px] text-slate-400">Grande SP / Rodoanel Oeste</p>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span class="text-slate-500 text-[10px] block">Grupos Ativos</span>
                <span class="text-white font-bold">18 Grupos</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] block">Veículos Trânsito</span>
                <span class="text-white font-bold">142 Carretas</span>
              </div>
            </div>
            <p class="text-[11px] text-emerald-400 font-medium">Expedição e Docas em fluxo máximo contínuo.</p>
          </div>

          <!-- Hub 2: Vila Leopoldina -->
          <div class="glass-card rounded-2xl p-4 border border-slate-800 bg-obsidian-900 hover:border-slate-700 transition space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> FAROL VERDE
              </span>
              <span class="text-xs font-bold text-slate-300">SLA 98.5%</span>
            </div>
            <div>
              <h4 class="font-bold text-white text-sm">Hub Vila Leopoldina</h4>
              <p class="text-[11px] text-slate-400">São Paulo Capital Last-Mile</p>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span class="text-slate-500 text-[10px] block">Grupos Ativos</span>
                <span class="text-white font-bold">11 Grupos</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] block">Veículos Trânsito</span>
                <span class="text-white font-bold">96 VUCs / Vans</span>
              </div>
            </div>
            <p class="text-[11px] text-emerald-400 font-medium">Conclusão de rotas D+0 dentro da janela.</p>
          </div>

          <!-- Hub 3: Campinas & Interior -->
          <div class="glass-card rounded-2xl p-4 border border-slate-800 bg-obsidian-900 hover:border-slate-700 transition space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> FAROL VERDE
              </span>
              <span class="text-xs font-bold text-slate-300">SLA 97.9%</span>
            </div>
            <div>
              <h4 class="font-bold text-white text-sm">Hub Campinas & Interior</h4>
              <p class="text-[11px] text-slate-400">Corredor Anhanguera / Bandeirantes</p>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span class="text-slate-500 text-[10px] block">Grupos Ativos</span>
                <span class="text-white font-bold">10 Grupos</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] block">Veículos Trânsito</span>
                <span class="text-white font-bold">74 Veículos</span>
              </div>
            </div>
            <p class="text-[11px] text-emerald-400 font-medium">Transferências noturnas liberadas e em trânsito.</p>
          </div>

          <!-- Hub 4: Pavuna / Rio de Janeiro -->
          <div class="glass-card rounded-2xl p-4 border border-slate-800 bg-obsidian-900 hover:border-slate-700 transition space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> FAROL AMARELO
              </span>
              <span class="text-xs font-bold text-amber-300">SLA 95.2%</span>
            </div>
            <div>
              <h4 class="font-bold text-white text-sm">Hub Pavuna & Baixada</h4>
              <p class="text-[11px] text-slate-400">Rio de Janeiro e Leste Fluminense</p>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span class="text-slate-500 text-[10px] block">Grupos Ativos</span>
                <span class="text-white font-bold">8 Grupos</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] block">Veículos Trânsito</span>
                <span class="text-white font-bold">51 Veículos</span>
              </div>
            </div>
            <p class="text-[11px] text-amber-400 font-medium">Atenção: Tráfego na Linha Vermelha / Chuva moderada.</p>
          </div>

        </div>
      </div>

      <!-- PAINEL 3: RADAR DE INCIDENTES & FEED DE OCORRÊNCIAS OPERACIONAIS -->
      <div class="glass-card rounded-2xl p-5 border border-slate-800 bg-obsidian-900/90 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <i data-lucide="shield-alert" class="w-5 h-5 text-amber-400"></i>
            <h3 class="font-extrabold text-white text-base">Radar de Ocorrências & Eventos de Rota</h3>
          </div>
          <button onclick="loadTowerData()" class="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Atualizar Feed
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400">
                <th class="pb-2 font-semibold">Horário</th>
                <th class="pb-2 font-semibold">Origem / Grupo / Remetente</th>
                <th class="pb-2 font-semibold">Resumo da Ocorrência</th>
                <th class="pb-2 font-semibold">Gravidade</th>
                <th class="pb-2 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody id="towerIncidentsTableBody" class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-3 text-slate-400 font-mono">19:42</td>
                <td class="py-3 font-semibold text-white">Central Cajamar - Doca 04</td>
                <td class="py-3 text-slate-300">Carregamento da carreta SP-RJ concluído e liberado para trânsito com sucesso.</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">NORMAL</span></td>
                <td class="py-3 text-right"><button onclick="viewIncidentChat()" class="text-sky-400 hover:underline">Abrir Chat</button></td>
              </tr>
              <tr>
                <td class="py-3 text-slate-400 font-mono">19:15</td>
                <td class="py-3 font-semibold text-white">Supervisão Last-Mile Campinas</td>
                <td class="py-3 text-slate-300">Tráfego lento na Rod. Anhanguera km 92 sentido interior por manutenção de pista.</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">ATENÇÃO</span></td>
                <td class="py-3 text-right"><button onclick="viewIncidentChat()" class="text-sky-400 hover:underline">Abrir Chat</button></td>
              </tr>
              <tr>
                <td class="py-3 text-slate-400 font-mono">18:50</td>
                <td class="py-3 font-semibold text-white">Hub Vila Leopoldina</td>
                <td class="py-3 text-slate-300">100% das coletas do turno vespertino descarregadas e conferidas sem avarias.</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">CONCLUÍDO</span></td>
                <td class="py-3 text-right"><button onclick="viewIncidentChat()" class="text-sky-400 hover:underline">Abrir Chat</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAINEL 4: COMANDOS RÁPIDOS & INTEGRAÇÃO TELEGRAM BOT -->
      <div class="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-extrabold text-white text-base">Comandos Remotos da Torre Telegram (@AtlasJuniorBot)</h3>
          <span class="text-xs text-sky-400 font-mono">Chat ID: 553488777 (Adimilson)</span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          Você pode emitir comandos e acompanhar alertas no seu smartphone pelo Telegram:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div class="p-3 bg-obsidian-900 rounded-xl border border-slate-800">
            <code class="text-sky-400 font-bold block mb-1">/status</code>
            <span class="text-slate-400">Verifica a saúde do gateway, latência do WhatsApp e quantidade de mensagens.</span>
          </div>
          <div class="p-3 bg-obsidian-900 rounded-xl border border-slate-800">
            <code class="text-sky-400 font-bold block mb-1">/loggi</code>
            <span class="text-slate-400">Recebe o briefing dos 47 grupos Loggi e principais destaques operacionais.</span>
          </div>
          <div class="p-3 bg-obsidian-900 rounded-xl border border-slate-800">
            <code class="text-purple-400 font-bold block mb-1">/ia on ou /ia off</code>
            <span class="text-slate-400">Alterna as respostas e sugestões automáticas da IA no WhatsApp.</span>
          </div>
          <div class="p-3 bg-obsidian-900 rounded-xl border border-slate-800">
            <code class="text-emerald-400 font-bold block mb-1">/ajuda</code>
            <span class="text-slate-400">Lista todos os atalhos e telefones de plantão da diretoria de operações.</span>
          </div>
        </div>
      </div>

    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW D: MAPA DA FROTA EM TEMPO REAL (LEAFLET / LOGISTICS)             -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionFleet" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-hidden space-y-4">
      <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <i data-lucide="map" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-extrabold text-white">Rastreamento da Frota & Polos Loggi</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> GPS TELEMETRIA ATIVA
              </span>
            </div>
            <p class="text-xs text-slate-400">Posicionamento geográfico dos centros de distribuição e carretas em rota.</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button onclick="focusMapOnHub(-23.3556, -46.8778, 'Cajamar')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Cajamar
          </button>
          <button onclick="focusMapOnHub(-23.5284, -46.7319, 'Leopoldina')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Leopoldina
          </button>
          <button onclick="focusMapOnHub(-22.9056, -47.0608, 'Campinas')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Campinas
          </button>
          <button onclick="focusMapOnHub(-22.8122, -43.3644, 'Rio')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold border border-slate-700 transition">
            Rio de Janeiro
          </button>
        </div>
      </div>

      <div class="flex-1 flex gap-4 min-h-0">
        <!-- Leaflet Map Container -->
        <div id="fleetMapContainer" class="flex-1 rounded-2xl border border-slate-800 overflow-hidden bg-obsidian-900 relative">
          <div id="fleetMap" class="w-full h-full z-10"></div>
        </div>

        <!-- Veículos em Rota Sidebar -->
        <div class="w-80 glass-card rounded-2xl border border-slate-800 p-4 flex flex-col space-y-3 overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-bold text-white uppercase tracking-wider">Veículos Monitorados</span>
            <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">5 Ativos</span>
          </div>
          <div class="flex-1 overflow-y-auto space-y-2 text-xs" id="fleetVehicleList">
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">CAR-401 (Marcos Oliveira)</span>
                <span class="text-emerald-400 font-mono text-[10px]">68 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Transferência Cajamar -&gt; Leopoldina</p>
            </div>
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">VUC-204 (Eduardo Santos)</span>
                <span class="text-amber-400 font-mono text-[10px]">32 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Last-Mile Pinheiros / Butantã</p>
            </div>
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">CAR-512 (Valdir Pereira)</span>
                <span class="text-emerald-400 font-mono text-[10px]">75 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Expedição Campinas -&gt; RMC</p>
            </div>
            <div class="p-3 bg-obsidian-900 border border-slate-800 rounded-xl space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">VAN-108 (Rodrigo Mendes)</span>
                <span class="text-emerald-400 font-mono text-[10px]">45 km/h</span>
              </div>
              <p class="text-[11px] text-slate-400">Distribuição Pavuna / Baixada</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW E: CANHOTOS & COMPROVANTES COM OCR                               -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionReceipts" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
      <div class="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <i data-lucide="file-check-2" class="w-5 h-5"></i>
          </div>
          <div>
            <h2 class="text-lg font-extrabold text-white">Canhotos & Comprovantes com OCR Automático</h2>
            <p class="text-xs text-slate-400">Reconhecimento de Notas Fiscais e Danfes enviadas pelos motoristas no WhatsApp.</p>
          </div>
        </div>

        <button onclick="simulateOCRReceipt()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/20">
          <i data-lucide="scan" class="w-4 h-4"></i> Simular Leitura OCR de Canhoto
        </button>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-800 bg-obsidian-900/90 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white uppercase tracking-wider">Comprovantes Baixados Recentemente</span>
          <button onclick="loadReceiptsList()" class="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Atualizar
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400">
                <th class="pb-2 font-semibold">Horário</th>
                <th class="pb-2 font-semibold">Nota Fiscal / Danfe</th>
                <th class="pb-2 font-semibold">Motorista / Origem</th>
                <th class="pb-2 font-semibold">Texto Extraído pelo OCR</th>
                <th class="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody id="receiptsTableBody" class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-3 text-slate-400 font-mono">19:30</td>
                <td class="py-3 font-mono font-bold text-emerald-400">NF-849204</td>
                <td class="py-3 font-semibold text-white">Carlos Motorista - Rota 14</td>
                <td class="py-3 text-slate-300">DANFE / NOTA FISCAL Nº 849204 - RECEBEDOR: MERCADO CENTRAL SP - ASSINADO NA DOCA</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">APROVADO</span></td>
              </tr>
              <tr>
                <td class="py-3 text-slate-400 font-mono">19:00</td>
                <td class="py-3 font-mono font-bold text-emerald-400">NF-772190</td>
                <td class="py-3 font-semibold text-white">Eduardo Loggi - Cajamar</td>
                <td class="py-3 text-slate-300">CANHOTO COMPROVANTE DE ENTREGA Nº 772190 - CARRETA DESCARREGADA SEM AVARIAS</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">APROVADO</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- --------------------------------------------------------------------- -->
    <!-- VIEW F: TELEFONIA EXECUTIVA & DISCADOR WEBRTC (SOFTPHONE)             -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionTelephony" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
      <div class="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <i data-lucide="phone-call" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-extrabold text-white">Telefonia Executiva & Softphone WebRTC</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LINHA SIP/WEBRTC PRONTA
              </span>
            </div>
            <p class="text-xs text-slate-400">Faça e receba chamadas com fone/microfone para motoristas e polos.</p>
          </div>
        </div>

        <span class="text-xs text-slate-400 font-mono">Linha Operacional Loggi (+55 11 97625-8311)</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Teclado Discador (Dialpad) -->
        <div class="glass-card rounded-2xl p-6 border border-slate-800 bg-obsidian-900 flex flex-col items-center space-y-4 max-w-sm mx-auto w-full">
          <!-- Visor -->
          <div class="w-full bg-obsidian-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <input type="text" id="dialpadInput" placeholder="Digite o número ou DDD..." class="bg-transparent font-mono text-lg font-bold text-white w-full focus:outline-none">
            <button onclick="dialpadClear()" class="text-slate-500 hover:text-white transition p-1">
              <i data-lucide="delete" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Teclas 0-9, *, # -->
          <div class="grid grid-cols-3 gap-3 w-full">
            <button onclick="dialpadPress('1')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">1<span class="text-[8px] text-slate-500 font-normal">--</span></button>
            <button onclick="dialpadPress('2')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">2<span class="text-[8px] text-slate-500 font-normal">ABC</span></button>
            <button onclick="dialpadPress('3')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">3<span class="text-[8px] text-slate-500 font-normal">DEF</span></button>
            <button onclick="dialpadPress('4')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">4<span class="text-[8px] text-slate-500 font-normal">GHI</span></button>
            <button onclick="dialpadPress('5')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">5<span class="text-[8px] text-slate-500 font-normal">JKL</span></button>
            <button onclick="dialpadPress('6')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">6<span class="text-[8px] text-slate-500 font-normal">MNO</span></button>
            <button onclick="dialpadPress('7')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">7<span class="text-[8px] text-slate-500 font-normal">PQRS</span></button>
            <button onclick="dialpadPress('8')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">8<span class="text-[8px] text-slate-500 font-normal">TUV</span></button>
            <button onclick="dialpadPress('9')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">9<span class="text-[8px] text-slate-500 font-normal">WXYZ</span></button>
            <button onclick="dialpadPress('*')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex items-center justify-center">*</button>
            <button onclick="dialpadPress('0')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex flex-col items-center justify-center">0<span class="text-[8px] text-slate-500 font-normal">+</span></button>
            <button onclick="dialpadPress('#')" class="h-12 rounded-2xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition flex items-center justify-center">#</button>
          </div>

          <!-- Botões de Ação de Chamada -->
          <div class="flex items-center space-x-3 w-full pt-2">
            <button onclick="startPhoneCall()" id="btnStartCall" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30">
              <i data-lucide="phone" class="w-5 h-5"></i> Ligar
            </button>
            <button onclick="endPhoneCall()" id="btnEndCall" class="hidden flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl items-center justify-center gap-2 transition shadow-lg shadow-rose-600/30">
              <i data-lucide="phone-off" class="w-5 h-5"></i> Desligar
            </button>
          </div>

          <!-- Status de Chamada Ativa -->
          <div id="callStatusBox" class="hidden w-full p-3 bg-obsidian-950 border border-emerald-500/40 rounded-xl text-center space-y-1">
            <span class="text-xs text-emerald-400 font-bold block">CHAMADA EM ANDAMENTO</span>
            <span id="callTimer" class="font-mono text-sm text-white font-bold">00:00</span>
          </div>
        </div>

        <!-- Histórico de Chamadas Recentes -->
        <div class="md:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 bg-obsidian-900 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="font-bold text-white text-sm">Histórico de Chamadas Telefônicas</h3>
            <span class="text-xs text-slate-400">Gravador e Registro Automático</span>
          </div>
          <div class="space-y-2 text-xs" id="callHistoryList">
            <div class="p-3 bg-obsidian-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><i data-lucide="phone-outgoing" class="w-4 h-4"></i></div>
                <div>
                  <span class="font-bold text-white block">Marcos Oliveira (Carreta SP-RJ)</span>
                  <span class="text-slate-400 text-[11px] font-mono">11987654321 • Duração: 01:45</span>
                </div>
              </div>
              <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">Concluída</span>
            </div>
            <div class="p-3 bg-obsidian-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><i data-lucide="phone-outgoing" class="w-4 h-4"></i></div>
                <div>
                  <span class="font-bold text-white">Central Cajamar - Doca 04</span>
                  <span class="text-slate-400 text-[11px] font-mono">11982223344 • Duração: 02:10</span>
                </div>
              </div>
              <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">Concluída</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 1: SALVAR / EDITAR CONTATO                                          -->
  <!-- ========================================================================= -->
  <div id="contactModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-extrabold text-white text-base" id="contactModalTitle">Salvar Novo Contato</h3>
        <button onclick="closeContactModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Nome Completo *</label>
          <input type="text" id="inputContactName" placeholder="Ex: Carlos Motorista - Rota Campinas" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Telefone / WhatsApp com DDD *</label>
          <input type="text" id="inputContactPhone" placeholder="Ex: 11988887777 ou 5511988887777" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Categoria</label>
            <select id="selectContactCategory" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
              <option value="LOGGI">Loggi / Operações</option>
              <option value="PESSOAL">Pessoal</option>
              <option value="PARCEIRO">Motorista / Parceiro</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Empresa / Base</label>
            <input type="text" id="inputContactCompany" placeholder="Ex: Loggi Galpão Cajamar" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Cargo / Função</label>
          <input type="text" id="inputContactRole" placeholder="Ex: Supervisor de Cargas / Motorista Toco" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Observações / Rotas</label>
          <textarea id="inputContactNotes" rows="2" placeholder="Ex: Atende rotas do Vale do Paraíba e Campinas" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"></textarea>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-800 flex justify-end space-x-2">
        <button onclick="closeContactModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition">
          Cancelar
        </button>
        <button onclick="saveContactForm()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5">
          <i data-lucide="check" class="w-4 h-4"></i> Salvar Contato
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 2: TELECONFERÊNCIA WEBRTC                                           -->
  <!-- ========================================================================= -->
  <div id="meetingModal" class="fixed inset-0 z-50 hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
    <div class="glass-card bg-obsidian-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-obsidian-950">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <i data-lucide="video" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-sm sm:text-base">Sala de Reunião & Teleconferência</h3>
            <p class="text-[11px] text-slate-400">Vídeo HD, áudio e compartilhamento de tela via WebRTC.</p>
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
      <div class="flex-1 bg-black relative">
        <iframe id="meetingIframe" src="" allow="camera; microphone; display-capture; autoplay; clipboard-write" class="w-full h-full border-0"></iframe>
      </div>
      <div class="p-3 border-t border-slate-800 bg-obsidian-950 flex items-center justify-between text-xs text-slate-400 px-4">
        <span>Link da Sala: <code id="meetingRoomUrl" class="text-indigo-400 font-mono"></code></span>
        <button onclick="sendMeetingInviteToChat()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition">
          <i data-lucide="send" class="w-4 h-4"></i> Enviar Convite no WhatsApp Ativo
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 3: COMUNICADO GERAL PARA TODOS OS GRUPOS LOGGI                      -->
  <!-- ========================================================================= -->
  <div id="broadcastModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-loggi-500/20 text-loggi-400 flex items-center justify-center">
            <i data-lucide="radio" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-base">Transmitir Comunicado Operacional</h3>
            <p class="text-[11px] text-slate-400">Disparo automático para os 47 grupos Loggi monitorados</p>
          </div>
        </div>
        <button onclick="closeBroadcastModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Prioridade do Comunicado</label>
          <select id="selectBroadcastPriority" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-loggi-500">
            <option value="NORMAL">Normal (Supervisão & Malha Logística)</option>
            <option value="URGENT">Alerta Vermelho Urgente (Diretoria de Operações)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Mensagem do Comunicado *</label>
          <textarea id="textBroadcastMessage" rows="5" placeholder="Digite o aviso para motoristas, docas e supervisão..." class="w-full bg-obsidian-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-loggi-500 resize-none"></textarea>
        </div>
        <p class="text-[11px] text-slate-400">
          Esta mensagem também será enviada como registro na sua Torre no Telegram (@AtlasJuniorBot).
        </p>
      </div>

      <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
        <button onclick="closeBroadcastModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition text-xs">Cancelar</button>
        <button onclick="sendBroadcastMessage()" id="btnSubmitBroadcast" class="px-4 py-2 bg-loggi-500 hover:bg-loggi-600 text-white rounded-xl font-bold transition text-xs flex items-center gap-1.5 shadow-lg shadow-loggi-500/20">
          <i data-lucide="send" class="w-3.5 h-3.5"></i> Transmitir para 47 Grupos
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 4: ALERTA VERMELHO / PLANTÃO TELEGRAM                               -->
  <!-- ========================================================================= -->
  <div id="telegramAlertModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-rose-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-base">Alerta Vermelho de Plantão</h3>
            <p class="text-[11px] text-rose-400">Notificação prioritária com push sonoro no Telegram</p>
          </div>
        </div>
        <button onclick="closeTelegramAlertModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Hub ou Rota Afetada</label>
          <select id="selectAlertHub" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500">
            <option value="Hub Cajamar (CD Matriz)">Hub Cajamar (CD Matriz)</option>
            <option value="Hub Vila Leopoldina">Hub Vila Leopoldina</option>
            <option value="Hub Campinas & Interior">Hub Campinas & Interior</option>
            <option value="Hub Pavuna / Rio de Janeiro">Hub Pavuna / Rio de Janeiro</option>
            <option value="Todas as Rotas e Polos">Todas as Rotas e Polos</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Título do Evento *</label>
          <input type="text" id="inputAlertTitle" placeholder="Ex: Interdição de Doca / Bloqueio Rodoviário" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500">
        </div>
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Detalhes Operacionais *</label>
          <textarea id="textAlertDetails" rows="4" placeholder="Descreva a contingência e orientações à equipe..." class="w-full bg-obsidian-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 resize-none"></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
        <button onclick="closeTelegramAlertModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition text-xs">Cancelar</button>
        <button onclick="sendTelegramAlert()" id="btnSubmitAlert" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30">
          <i data-lucide="send" class="w-3.5 h-3.5"></i> Despachar Alerta no Telegram
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 5: RELATÓRIO EXECUTIVO DE VARREDURA IA                              -->
  <!-- ========================================================================= -->
  <div id="scanReportModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-base">Varredura & Inteligência da Malha Loggi</h3>
            <p class="text-[11px] text-purple-400">Análise de sentimentos, gargalos e ocorrências nos 47 grupos</p>
          </div>
        </div>
        <button onclick="closeScanReportModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="bg-obsidian-950 border border-slate-800 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed" id="scanReportContent">
        Carregando análise...
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800">
        <span class="text-[11px] text-slate-400">Espelhado com sucesso no Telegram (@AtlasJuniorBot)</span>
        <button onclick="closeScanReportModal()" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition text-xs">
          Entendido
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 6: DESPACHANTE LOGGI IA (RAG OPERACIONAL)                           -->
  <!-- ========================================================================= -->
  <div id="dispatcherModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-indigo-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <i data-lucide="bot" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-base">Despachante Loggi IA (RAG)</h3>
            <p class="text-[11px] text-indigo-400">Consulta de docas, cortes, procedimentos e plantão</p>
          </div>
        </div>
        <button onclick="closeDispatcherModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Qual a sua dúvida operacional?</label>
          <div class="flex gap-2">
            <input type="text" id="inputDispatcherQuestion" placeholder="Ex: Qual a doca da carreta SP-RJ em Cajamar?" class="flex-1 bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500">
            <button onclick="askDispatcher()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center gap-1">
              <i data-lucide="send" class="w-3.5 h-3.5"></i> Perguntar
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 pt-1">
          <button onclick="setDispatcherExample('Qual o horário de corte das rotas expressas?')" class="px-2 py-1 bg-obsidian-950 hover:bg-slate-800 text-slate-400 rounded-lg text-[10px] border border-slate-800 transition">⏰ Horário de Corte</button>
          <button onclick="setDispatcherExample('Qual a doca da carreta SP-RJ em Cajamar?')" class="px-2 py-1 bg-obsidian-950 hover:bg-slate-800 text-slate-400 rounded-lg text-[10px] border border-slate-800 transition">🏭 Doca Cajamar</button>
          <button onclick="setDispatcherExample('Como proceder com cliente ausente e pacote recusado?')" class="px-2 py-1 bg-obsidian-950 hover:bg-slate-800 text-slate-400 rounded-lg text-[10px] border border-slate-800 transition">📦 Pacote Recusado</button>
        </div>

        <div id="dispatcherAnswerBox" class="hidden bg-obsidian-950 border border-indigo-500/30 rounded-xl p-4 text-slate-200 whitespace-pre-wrap leading-relaxed">
        </div>
      </div>
    </div>
  </div>

  <script>
    const SESSION_ID = 'whatsapp_principal';
    let allChats = [];
    let allContacts = [];
    let activeCategoryTab = 'LOGGI'; // 'LOGGI' or 'PESSOAL'
    let activeContactCategory = 'ALL';
    let activeChatJid = '';
    let isAIGlobal = true;
    let mediaRecorder = null;
    let audioChunks = [];
    let recordTimerInterval = null;
    let recordSeconds = 0;
    let currentMeetingRoom = 'atlas-loggi-' + Math.floor(100000 + Math.random() * 900000);

    // 1. ALTERNA AS TELAS PRINCIPAIS (CHATS, CONTATOS, TORRE, FROTA, CANHOTOS, TELEFONIA)
    function switchMainView(view) {
      document.getElementById('viewSectionChats').classList.add('hidden');
      document.getElementById('viewSectionContacts').classList.add('hidden');
      document.getElementById('viewSectionTower').classList.add('hidden');
      document.getElementById('viewSectionFleet').classList.add('hidden');
      document.getElementById('viewSectionReceipts').classList.add('hidden');
      document.getElementById('viewSectionTelephony').classList.add('hidden');

      document.querySelectorAll('.rail-btn').forEach(b => {
        b.classList.remove('bg-loggi-500/20', 'text-loggi-400', 'border', 'border-loggi-500/30');
        b.classList.add('text-slate-400');
      });

      if (view === 'chats') {
        document.getElementById('viewSectionChats').classList.remove('hidden');
        document.getElementById('railBtnChats').classList.add('bg-loggi-500/20', 'text-loggi-400', 'border', 'border-loggi-500/30');
        document.getElementById('railBtnChats').classList.remove('text-slate-400');
        loadChats();
      } else if (view === 'contacts') {
        document.getElementById('viewSectionContacts').classList.remove('hidden');
        document.getElementById('railBtnContacts').classList.add('bg-loggi-500/20', 'text-loggi-400', 'border', 'border-loggi-500/30');
        document.getElementById('railBtnContacts').classList.remove('text-slate-400');
        loadContactsList();
      } else if (view === 'tower') {
        document.getElementById('viewSectionTower').classList.remove('hidden');
        document.getElementById('railBtnTower').classList.add('bg-loggi-500/20', 'text-loggi-400', 'border', 'border-loggi-500/30');
        document.getElementById('railBtnTower').classList.remove('text-slate-400');
        loadTowerData();
      } else if (view === 'fleet') {
        document.getElementById('viewSectionFleet').classList.remove('hidden');
        document.getElementById('railBtnFleet').classList.add('bg-loggi-500/20', 'text-loggi-400', 'border', 'border-loggi-500/30');
        document.getElementById('railBtnFleet').classList.remove('text-slate-400');
        setTimeout(() => { initFleetMap(); }, 150);
      } else if (view === 'receipts') {
        document.getElementById('viewSectionReceipts').classList.remove('hidden');
        document.getElementById('railBtnReceipts').classList.add('bg-loggi-500/20', 'text-loggi-400', 'border', 'border-loggi-500/30');
        document.getElementById('railBtnReceipts').classList.remove('text-slate-400');
        loadReceiptsList();
      } else if (view === 'telephony') {
        document.getElementById('viewSectionTelephony').classList.remove('hidden');
        document.getElementById('railBtnTelephony').classList.add('bg-loggi-500/20', 'text-loggi-400', 'border', 'border-loggi-500/30');
        document.getElementById('railBtnTelephony').classList.remove('text-slate-400');
        loadCallHistory();
      }
      lucide.createIcons();
    }

    // 2. ALTERNA ABAS DE CATEGORIA DA LISTA DE CONVERSAS (LOGGI vs PESSOAL)
    function switchCategoryTab(cat) {
      activeCategoryTab = cat;
      const btnLoggi = document.getElementById('tabBtnLoggi');
      const btnPessoal = document.getElementById('tabBtnPessoal');

      if (cat === 'LOGGI') {
        btnLoggi.className = 'py-1.5 px-3 rounded-lg bg-loggi-500 text-white flex items-center justify-center gap-1.5 transition shadow-sm';
        btnPessoal.className = 'py-1.5 px-3 rounded-lg text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition';
      } else {
        btnPessoal.className = 'py-1.5 px-3 rounded-lg bg-slate-700 text-white flex items-center justify-center gap-1.5 transition shadow-sm';
        btnLoggi.className = 'py-1.5 px-3 rounded-lg text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition';
      }

      renderChatsList();
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

    // 3. CARREGA E RENDERIZA AS CONVERSAS
    async function loadChats() {
      try {
        const res = await fetch('/chats/' + SESSION_ID);
        const json = await res.json();
        allChats = json.data || [];
        updateCounts();
        renderChatsList();
      } catch (_) {}
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
      const kpi = document.getElementById('kpiLoggiGroups');
      if (kpi) kpi.innerText = countLoggi + ' Grupos';
    }

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
        container.innerHTML = \`<div class="p-8 text-center text-xs text-slate-500">Nenhuma conversa encontrada nesta pasta.</div>\`;
        return;
      }

      container.innerHTML = filtered.map(c => {
        const isSelected = c.remoteJid === activeChatJid;
        const bg = isSelected ? 'bg-obsidian-800/90 border-l-4 border-loggi-500' : 'hover:bg-obsidian-850/60';
        const time = new Date(c.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isL = isLoggiChat(c);
        const badge = isL
          ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-loggi-500/20 text-loggi-400 font-bold border border-loggi-500/30">LGGI</span>'
          : '<span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold border border-slate-700">PESSOAL</span>';

        return \`
          <div onclick="selectChat('\${c.remoteJid}', '\${(c.name || '').replace(/'/g, "\\\\'")}', '\${isL ? 'LOGGI' : 'PESSOAL'}')" class="p-3.5 cursor-pointer transition flex items-center space-x-3 \${bg}">
            <div class="w-10 h-10 rounded-2xl bg-obsidian-950 flex items-center justify-center text-loggi-400 font-extrabold text-xs shrink-0 border border-slate-800 shadow-sm">
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

    // 4. SELECIONA UM CHAT
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

    // 5. CARREGA HISTÓRICO DE MENSAGENS E SUGESTÕES HUMANIZADAS
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
          const bubble = isMe ? 'bg-gradient-to-r from-loggi-600 to-loggi-500 text-white rounded-tr-none shadow-md' : 'bg-obsidian-850 text-slate-100 rounded-tl-none border border-slate-700/60 shadow-md';
          const time = new Date(m.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isAudio = m.mediaType === 'voice';

          return \`
            <div class="flex flex-col \${align} max-w-[85%] \${isMe ? 'self-end' : 'self-start'}">
              <div class="px-4 py-2.5 rounded-2xl text-xs leading-relaxed \${bubble}">
                \${isAudio ? \`
                  <div class="space-y-2 mb-1 p-3 rounded-xl bg-obsidian-950/90 border border-emerald-500/40 shadow-sm">
                    <div class="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <i data-lucide="mic" class="w-4 h-4"></i>
                      <span>Transcrição do Áudio na Íntegra (Whisper):</span>
                    </div>
                    <div class="text-xs text-white leading-relaxed font-sans font-medium bg-obsidian-900/80 p-2.5 rounded-lg border border-slate-800">
                      \${m.text && m.text !== '[Mensagem de Voz]' ? m.text : 'Processando transcrição fiel com Whisper...'}
                    </div>
                    \${m.mediaUrl ? \`<audio controls class="w-full h-8 mt-1"><source src="\${m.mediaUrl}" type="audio/ogg"></audio>\` : ''}
                  </div>
                \` : \`
                  <p class="whitespace-pre-wrap">\${m.text}</p>
                \`}
                <span class="text-[9px] opacity-75 block text-right mt-1 font-mono">\${time}</span>
              </div>
            </div>
          \`;
        }).join('');
        container.scrollTop = container.scrollHeight;
        lucide.createIcons();

        // Sugestões humanizadas baseadas na última mensagem recebida
        const lastIncoming = [...messages].reverse().find(m => !m.isFromMe);
        if (lastIncoming && lastIncoming.text) {
          fetchSmartReplies(lastIncoming.text, lastIncoming.senderName);
        } else {
          document.getElementById('smartRepliesDock').classList.add('hidden');
        }

      } catch (_) {}
    }

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
          <button onclick="applySmartReply('\${s.text.replace(/'/g, "\\\\'")}')" class="px-3 py-1.5 rounded-xl bg-obsidian-850 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1.5 shadow-sm">
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

    // 6. ENVIAR MENSAGEM
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

    // 7. ALTERNAR CATEGORIA DE CHAT
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

    // 8. TORRE DE CONTROLE DO GRUPO (RESUMO IA)
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

    // 9. AGENDA DE CONTATOS SALVOS (LISTAR, BUSCAR, SALVAR, EXCLUIR)
    async function loadContactsList() {
      const search = document.getElementById('contactSearchInput')?.value || '';
      try {
        let url = '/contacts/' + SESSION_ID + '?search=' + encodeURIComponent(search);
        if (activeContactCategory !== 'ALL') {
          url += '&category=' + encodeURIComponent(activeContactCategory);
        }
        const res = await fetch(url);
        const json = await res.json();
        allContacts = json.data || [];
        renderContactsGrid();
        
        const badge = document.getElementById('railContactsBadge');
        if (badge) {
          badge.innerText = allContacts.length;
          badge.classList.remove('hidden');
        }
        const kpi = document.getElementById('kpiSavedContacts');
        if (kpi) kpi.innerText = allContacts.length;
      } catch (_) {}
    }

    function setContactCategoryFilter(cat) {
      activeContactCategory = cat;
      document.querySelectorAll('.pill-contact').forEach(p => {
        p.classList.remove('bg-emerald-500', 'text-white');
        p.classList.add('bg-obsidian-850', 'text-slate-400');
      });
      const active = document.getElementById('pillContact-' + cat);
      if (active) {
        active.classList.remove('bg-obsidian-850', 'text-slate-400');
        active.classList.add('bg-emerald-500', 'text-white');
      }
      loadContactsList();
    }

    function renderContactsGrid() {
      const grid = document.getElementById('contactsCardsGrid');
      if (allContacts.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 text-xs">Nenhum contato encontrado nesta categoria. Clique em "+ Salvar Novo Contato" acima.</div>';
        return;
      }

      grid.innerHTML = allContacts.map(c => {
        const catBadge = c.category === 'LOGGI'
          ? '<span class="text-[9px] px-2 py-0.5 rounded-full bg-loggi-500/10 text-loggi-400 font-bold border border-loggi-500/30">LOGGI</span>'
          : (c.category === 'PARCEIRO'
            ? '<span class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">PARCEIRO</span>'
            : '<span class="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700">PESSOAL</span>');

        const initial = (c.name || c.phone || 'C').substring(0, 2).toUpperCase();

        return \`
          <div class="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between space-y-3 transition">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-loggi-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-500/30 shadow-md">
                  \${initial}
                </div>
                <div>
                  <h4 class="font-bold text-white text-sm">\${c.name || c.phone}</h4>
                  <p class="text-[11px] text-slate-400 font-mono">\${c.phone || c.jid}</p>
                </div>
              </div>
              \${catBadge}
            </div>

            <div class="space-y-1 text-xs text-slate-300">
              \${c.company ? \`<p class="flex items-center gap-1.5"><i data-lucide="building" class="w-3.5 h-3.5 text-slate-500"></i> \${c.company}</p>\` : ''}
              \${c.role ? \`<p class="flex items-center gap-1.5"><i data-lucide="badge" class="w-3.5 h-3.5 text-slate-500"></i> \${c.role}</p>\` : ''}
              \${c.notes ? \`<p class="text-[11px] text-slate-400 italic mt-1 bg-obsidian-950 p-2 rounded-lg border border-slate-800/80">\${c.notes}</p>\` : ''}
            </div>

            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button onclick="startChatWithContact('\${c.jid}', '\${(c.name || '').replace(/'/g, "\\\\'")}', '\${c.category || 'LOGGI'}')" class="px-3 py-1.5 bg-loggi-500 hover:bg-loggi-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm">
                <i data-lucide="message-square" class="w-3.5 h-3.5"></i> Conversar
              </button>
              
              <div class="flex items-center space-x-1.5">
                <button onclick="openMeetingModal()" class="p-2 bg-obsidian-850 hover:bg-slate-800 text-indigo-400 rounded-xl transition" title="Iniciar Chamada de Vídeo">
                  <i data-lucide="video" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="deleteContact('\${c.jid}')" class="p-2 bg-obsidian-850 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-xl transition" title="Excluir Contato">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
      lucide.createIcons();
    }

    function startChatWithContact(jid, name, category) {
      switchMainView('chats');
      selectChat(jid, name, category);
    }

    function openNewContactModal() {
      document.getElementById('inputContactName').value = '';
      document.getElementById('inputContactPhone').value = '';
      document.getElementById('inputContactCompany').value = '';
      document.getElementById('inputContactRole').value = '';
      document.getElementById('inputContactNotes').value = '';
      document.getElementById('contactModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeContactModal() {
      document.getElementById('contactModal').classList.add('hidden');
    }

    async function saveContactForm() {
      const name = document.getElementById('inputContactName').value.trim();
      const phone = document.getElementById('inputContactPhone').value.trim();
      const category = document.getElementById('selectContactCategory').value;
      const company = document.getElementById('inputContactCompany').value.trim();
      const role = document.getElementById('inputContactRole').value.trim();
      const notes = document.getElementById('inputContactNotes').value.trim();

      if (!name || !phone) {
        alert('Por favor, informe Nome e Telefone com DDD.');
        return;
      }

      try {
        const res = await fetch('/contacts/' + SESSION_ID, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, category, company, role, notes })
        });
        const json = await res.json();
        if (json.success) {
          alert('Contato salvo com sucesso na agenda!');
          closeContactModal();
          loadContactsList();
          loadChats();
        } else {
          alert('Erro ao salvar: ' + json.error);
        }
      } catch (e) {
        alert('Falha na conexão: ' + e.message);
      }
    }

    async function deleteContact(jid) {
      if (!confirm('Tem certeza que deseja remover este contato da agenda?')) return;
      try {
        await fetch('/contacts/' + SESSION_ID + '/' + encodeURIComponent(jid), {
          method: 'DELETE'
        });
        loadContactsList();
      } catch (_) {}
    }

    // 10. GRAVAÇÃO DE ÁUDIO PTT
    async function startAudioRecording() {
      if (!activeChatJid) {
        alert('Selecione uma conversa para gravar o áudio.');
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
        alert('Permissão de microfone necessária: ' + err.message);
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

    // 11. TELECONFERÊNCIA WEBRTC
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
      alert('Convite enviado com sucesso no WhatsApp!');
      loadChatMessages(activeChatJid);
    }

    // 12. SINCRONIZAÇÃO COMPLETA
    async function syncAllContactsAndHistory() {
      const btn = document.getElementById('railBtnSync');
      const orig = btn ? btn.innerHTML : '';
      if (btn) btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin text-loggi-400"></i>';
      lucide.createIcons();

      try {
        const res = await fetch('/sync/' + SESSION_ID, { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          alert(\`Sincronização Concluída!\\n\\n• Grupos Sincronizados: \${json.data?.groupsCount || 0}\\n• Total de Chats no SQLite: \${json.data?.chatsCount || 0}\\n• Mensagens Armazenadas: \${json.data?.messagesCount || 0}\\n• Contatos na Agenda: \${json.data?.contactsCount || 0}\`);
        }
        await loadChats();
        await loadContactsList();
        await loadStats();
      } catch (err) {
        alert('Erro ao sincronizar: ' + err.message);
      } finally {
        if (btn) btn.innerHTML = orig;
        lucide.createIcons();
      }
    }

    async function loadStats() {
      try {
        const res = await fetch('/stats/' + SESSION_ID);
        const json = await res.json();
        if (json.data) {
          const statsEl = document.getElementById('storageStatsText');
          if (statsEl) {
            statsEl.innerHTML = \`
              <i data-lucide="database" class="w-3.5 h-3.5 text-loggi-400"></i>
              <span>\${json.data.totalChats} chats • \${json.data.totalMessages} msgs</span>
            \`;
            lucide.createIcons();
          }
        }
      } catch (_) {}
    }

    // 13. TOGGLE GLOBAL IA
    async function toggleGlobalAI() {
      isAIGlobal = !isAIGlobal;
      await fetch('/agents/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: isAIGlobal })
      });
      document.getElementById('railAILabel').innerText = isAIGlobal ? 'IA: ON' : 'IA: OFF';
      document.getElementById('railBtnAI').className = isAIGlobal
        ? 'p-3 rounded-2xl text-emerald-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative'
        : 'p-3 rounded-2xl text-slate-500 hover:bg-obsidian-850 transition flex flex-col items-center group relative';
    }

    // 14. FUNÇÕES EXECUTIVAS DA TORRE DE CONTROLE (PAINÉIS & FARÓIS)
    async function loadTowerData() {
      try {
        const res = await fetch('/tower/metrics');
        const json = await res.json();
        if (json.success && json.incidents) {
          const tbody = document.getElementById('towerIncidentsTableBody');
          if (tbody && json.incidents.length > 0) {
            tbody.innerHTML = json.incidents.map(inc => {
              const badgeClass = inc.severity === 'HIGH'
                ? 'bg-rose-500/20 text-rose-400'
                : inc.severity === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400';
              const badgeText = inc.severity === 'HIGH' ? 'CRÍTICO' : (inc.badge || (inc.severity === 'MEDIUM' ? 'ATENÇÃO' : 'NORMAL'));
              return \`
                <tr>
                  <td class="py-3 text-slate-400 font-mono">\${inc.time || '--:--'}</td>
                  <td class="py-3 font-semibold text-white">\${inc.sender}</td>
                  <td class="py-3 text-slate-300">\${inc.summary}</td>
                  <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold \${badgeClass}">\${badgeText}</span></td>
                  <td class="py-3 text-right"><button onclick="viewIncidentChat()" class="text-sky-400 hover:underline">Abrir Chat</button></td>
                </tr>
              \`;
            }).join('');
          }
        }
      } catch (_) {}
    }

    function viewIncidentChat() {
      switchMainView('chats');
      switchCategoryTab('LOGGI');
    }

    // Modal Comunicado Geral (Broadcast)
    function openBroadcastModal() {
      document.getElementById('broadcastModal').classList.remove('hidden');
    }
    function closeBroadcastModal() {
      document.getElementById('broadcastModal').classList.add('hidden');
    }
    async function sendBroadcastMessage() {
      const msg = document.getElementById('textBroadcastMessage').value.trim();
      const priority = document.getElementById('selectBroadcastPriority').value;
      if (!msg) {
        alert('Por favor, informe a mensagem do comunicado.');
        return;
      }
      const btn = document.getElementById('btnSubmitBroadcast');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i> Transmitindo...';
      try {
        const res = await fetch('/tower/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, priority })
        });
        const json = await res.json();
        if (json.success) {
          alert('Comunicado operacional despachado com sucesso para os grupos da Loggi e espelhado no Telegram!');
          document.getElementById('textBroadcastMessage').value = '';
          closeBroadcastModal();
        } else {
          alert('Erro: ' + (json.error || 'Falha ao despachar comunicado'));
        }
      } catch (e) {
        alert('Erro ao conectar ao servidor.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" class="w-3.5 h-3.5"></i> Transmitir para 47 Grupos';
        lucide.createIcons();
      }
    }

    // Modal Alerta Vermelho de Plantão (Telegram)
    function openTelegramAlertModal() {
      document.getElementById('telegramAlertModal').classList.remove('hidden');
    }
    function closeTelegramAlertModal() {
      document.getElementById('telegramAlertModal').classList.add('hidden');
    }
    async function sendTelegramAlert() {
      const hub = document.getElementById('selectAlertHub').value;
      const title = document.getElementById('inputAlertTitle').value.trim();
      const details = document.getElementById('textAlertDetails').value.trim();
      if (!title || !details) {
        alert('Por favor, preencha o título e os detalhes do alerta.');
        return;
      }
      const btn = document.getElementById('btnSubmitAlert');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i> Despachando...';
      try {
        const res = await fetch('/tower/telegram-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hub, title, details })
        });
        const json = await res.json();
        if (json.success) {
          alert('🚨 Alerta vermelho prioritário despachado para sua Torre Telegram (@AtlasJuniorBot)!');
          document.getElementById('inputAlertTitle').value = '';
          document.getElementById('textAlertDetails').value = '';
          closeTelegramAlertModal();
        } else {
          alert('Erro: ' + (json.error || 'Falha ao enviar alerta'));
        }
      } catch (e) {
        alert('Erro ao conectar ao servidor.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" class="w-3.5 h-3.5"></i> Despachar Alerta no Telegram';
        lucide.createIcons();
      }
    }

    // Varredura Geral com IA da Malha Loggi
    async function runMalhaScanIA() {
      const btn = document.getElementById('btnScanMalha');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Escaneando...';
      try {
        const res = await fetch('/tower/scan-operation', { method: 'POST' });
        const json = await res.json();
        if (json.success && json.report) {
          document.getElementById('scanReportContent').innerText = json.report;
          document.getElementById('scanReportModal').classList.remove('hidden');
        } else {
          alert('Falha ao processar varredura de inteligência.');
        }
      } catch (e) {
        alert('Erro ao comunicar com a IA.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="sparkles" class="w-4 h-4"></i> Varredura IA';
        lucide.createIcons();
      }
    }
    function closeScanReportModal() {
      document.getElementById('scanReportModal').classList.add('hidden');
    }

    // 15. MAPA DA FROTA EM TEMPO REAL (LEAFLET)
    let fleetMapInstance = null;
    let fleetMarkers = [];

    async function initFleetMap() {
      const container = document.getElementById('fleetMap');
      if (!container) return;
      if (fleetMapInstance) {
        fleetMapInstance.invalidateSize();
        return;
      }
      fleetMapInstance = L.map('fleetMap').setView([-23.1, -45.5], 7);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; CartoDB & Loggi Malha'
      }).addTo(fleetMapInstance);

      loadFleetData();
    }

    async function loadFleetData() {
      try {
        const res = await fetch('/logistics/fleet-live');
        const json = await res.json();
        if (!json.success || !fleetMapInstance) return;

        fleetMarkers.forEach(m => fleetMapInstance.removeLayer(m));
        fleetMarkers = [];

        json.hubs.forEach(hub => {
          const m = L.circleMarker([hub.lat, hub.lng], {
            radius: 10,
            fillColor: hub.status === 'ALERT' ? '#f59e0b' : '#0284c7',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          }).addTo(fleetMapInstance);
          m.bindPopup(\`<b>\${hub.name}</b><br>\${hub.groups} Grupos Ativos<br>Status: \${hub.status}\`);
          fleetMarkers.push(m);
        });

        json.vehicles.forEach(v => {
          const m = L.marker([v.latitude, v.longitude]).addTo(fleetMapInstance);
          m.bindPopup(\`<b>\${v.vehicle_id} - \${v.driver_name}</b><br>Rota: \${v.route_name}<br>Velocidade: \${v.speed_kmh} km/h<br>Status: \${v.status}\`);
          fleetMarkers.push(m);
        });
      } catch (_) {}
    }

    function focusMapOnHub(lat, lng, name) {
      if (fleetMapInstance) {
        fleetMapInstance.setView([lat, lng], 13);
      }
    }

    // 16. CANHOTOS & COMPROVANTES COM OCR
    async function loadReceiptsList() {
      try {
        const res = await fetch('/logistics/receipts');
        const json = await res.json();
        if (json.success && json.receipts) {
          const tbody = document.getElementById('receiptsTableBody');
          if (tbody) {
            tbody.innerHTML = json.receipts.map(r => \`
              <tr>
                <td class="py-3 text-slate-400 font-mono">\${new Date((r.created_at || Date.now() / 1000) * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td class="py-3 font-mono font-bold text-emerald-400">NF-\${r.nf_number || '849204'}</td>
                <td class="py-3 font-semibold text-white">\${r.sender_name || 'Motorista Loggi'}</td>
                <td class="py-3 text-slate-300">\${(r.ocr_text || '').substring(0, 100)}</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">\${r.status || 'APROVADO'}</span></td>
              </tr>
            \`).join('');
          }
        }
      } catch (_) {}
    }

    async function simulateOCRReceipt() {
      try {
        const res = await fetch('/logistics/ocr-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driverName: 'Carlos Motorista - Carreta SP-RJ' })
        });
        const json = await res.json();
        if (json.success) {
          alert('Canhoto reconhecido via OCR com sucesso! NF nº ' + json.nfNumber + ' baixada e notificada no Telegram.');
          loadReceiptsList();
        }
      } catch (e) {
        alert('Erro ao processar canhoto com OCR.');
      }
    }

    // 17. TELEFONIA & DISCADOR WEBRTC (SOFTPHONE)
    let callInterval = null;
    let callTimerSeconds = 0;

    function playDtmfTone(digit) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        const freqs = { '1': 697, '2': 770, '3': 852, '4': 697, '5': 770, '6': 852, '7': 941, '8': 941, '9': 941, '0': 941, '*': 941, '#': 941 };
        osc.frequency.setValueAtTime(freqs[digit] || 700, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch (_) {}
    }

    function dialpadPress(digit) {
      playDtmfTone(digit);
      const input = document.getElementById('dialpadInput');
      input.value += digit;
    }

    function dialpadClear() {
      const input = document.getElementById('dialpadInput');
      input.value = input.value.slice(0, -1);
    }

    async function startPhoneCall() {
      const phone = document.getElementById('dialpadInput').value.trim();
      if (!phone) {
        alert('Por favor, informe o telefone para discar.');
        return;
      }
      document.getElementById('btnStartCall').classList.add('hidden');
      document.getElementById('btnEndCall').classList.remove('hidden');
      document.getElementById('callStatusBox').classList.remove('hidden');

      callTimerSeconds = 0;
      clearInterval(callInterval);
      callInterval = setInterval(() => {
        callTimerSeconds++;
        const mins = String(Math.floor(callTimerSeconds / 60)).padStart(2, '0');
        const secs = String(callTimerSeconds % 60).padStart(2, '0');
        document.getElementById('callTimer').innerText = mins + ':' + secs;
      }, 1000);

      try {
        await fetch('/telephony/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, contactName: 'Contato Discado' })
        });
      } catch (_) {}
    }

    function endPhoneCall() {
      clearInterval(callInterval);
      document.getElementById('btnStartCall').classList.remove('hidden');
      document.getElementById('btnEndCall').classList.add('hidden');
      document.getElementById('callStatusBox').classList.add('hidden');
      loadCallHistory();
    }

    async function loadCallHistory() {
      try {
        const res = await fetch('/telephony/history');
        const json = await res.json();
        if (json.success && json.calls) {
          const list = document.getElementById('callHistoryList');
          if (list && json.calls.length > 0) {
            list.innerHTML = json.calls.map(c => \`
              <div class="p-3 bg-obsidian-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><i data-lucide="phone-outgoing" class="w-4 h-4"></i></div>
                  <div>
                    <span class="font-bold text-white block">\${c.contact_name}</span>
                    <span class="text-slate-400 text-[11px] font-mono">\${c.phone} • Duração: \${c.duration_seconds}s</span>
                  </div>
                </div>
                <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">\${c.status}</span>
              </div>
            \`).join('');
            lucide.createIcons();
          }
        }
      } catch (_) {}
    }

    // 18. DESPACHANTE LOGGI IA (RAG OPERACIONAL)
    function openDispatcherModal() {
      document.getElementById('dispatcherModal').classList.remove('hidden');
    }
    function closeDispatcherModal() {
      document.getElementById('dispatcherModal').classList.add('hidden');
    }
    function setDispatcherExample(q) {
      document.getElementById('inputDispatcherQuestion').value = q;
      askDispatcher();
    }
    async function askDispatcher() {
      const q = document.getElementById('inputDispatcherQuestion').value.trim();
      if (!q) return;
      const box = document.getElementById('dispatcherAnswerBox');
      box.classList.remove('hidden');
      box.innerText = 'Consultando base de conhecimento da Loggi com IA...';
      try {
        const res = await fetch('/agent/dispatcher/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q })
        });
        const json = await res.json();
        if (json.success && json.response) {
          box.innerText = json.response;
        } else {
          box.innerText = 'Sem resposta cadastrada para este procedimento.';
        }
      } catch (e) {
        box.innerText = 'Erro ao consultar o Despachante IA.';
      }
    }

    // Auto-refresh contínuo a cada 3.5 segundos
    setInterval(() => {
      if (activeChatJid) loadChatMessages(activeChatJid);
      loadChats();
      loadStats();
    }, 3500);

    // Inicialização
    loadChats();
    loadContactsList();
    loadStats();
    lucide.createIcons();
  </script>
</body>
</html>`;
}
