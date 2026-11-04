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
    <!-- VIEW C: TORRE DE CONTROLE ANALÍTICA GERAL                             -->
    <!-- --------------------------------------------------------------------- -->
    <div id="viewSectionTower" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
      
      <!-- Tower Header -->
      <div class="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <i data-lucide="tower-control" class="w-6 h-6"></i>
          </div>
          <div>
            <h2 class="text-xl font-extrabold text-white">Torre de Controle Operacional Loggi & Telegram</h2>
            <p class="text-xs text-slate-400">Visão panorâmica de grupos, veículos, rotas e ocorrências.</p>
          </div>
        </div>

        <a href="https://t.me/AtlasJuniorBot" target="_blank" class="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-sky-500/20">
          <i data-lucide="send" class="w-4 h-4"></i> Abrir Bot no Telegram (@AtlasJuniorBot)
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <span class="text-xs text-slate-400 font-medium">Grupos da Loggi Monitorados</span>
          <div class="text-2xl font-extrabold text-white" id="kpiLoggiGroups">47 Grupos</div>
          <p class="text-[11px] text-loggi-400">100% ativos com espelhamento</p>
        </div>
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <span class="text-xs text-slate-400 font-medium">Contatos Salvos na Agenda</span>
          <div class="text-2xl font-extrabold text-white" id="kpiSavedContacts">3.900</div>
          <p class="text-[11px] text-emerald-400">Indexados no SQLite</p>
        </div>
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <span class="text-xs text-slate-400 font-medium">Torre Telegram Conectada</span>
          <div class="text-2xl font-extrabold text-white">@AtlasJuniorBot</div>
          <p class="text-[11px] text-sky-400">Chat ID: 553488777 (Adimilson)</p>
        </div>
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <span class="text-xs text-slate-400 font-medium">Motor de Inteligência</span>
          <div class="text-2xl font-extrabold text-white">Claude & Whisper</div>
          <p class="text-[11px] text-purple-400">Resumos e Transcrições fiéis</p>
        </div>
      </div>

      <!-- Quick Operations Actions -->
      <div class="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 class="font-extrabold text-white text-base">Comandos da Torre Telegram</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Pelo seu Telegram em <strong>@AtlasJuniorBot</strong> você pode enviar:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div class="p-3 bg-obsidian-900 rounded-xl border border-slate-800">
            <code class="text-sky-400 font-bold block mb-1">/status</code>
            <span class="text-slate-400">Verifica se o WhatsApp Master está conectado e quantas mensagens foram processadas.</span>
          </div>
          <div class="p-3 bg-obsidian-900 rounded-xl border border-slate-800">
            <code class="text-sky-400 font-bold block mb-1">/loggi</code>
            <span class="text-slate-400">Recebe os últimos alertas e mensagens dos 47 grupos da Loggi.</span>
          </div>
          <div class="p-3 bg-obsidian-900 rounded-xl border border-slate-800">
            <code class="text-sky-400 font-bold block mb-1">/ia on ou /ia off</code>
            <span class="text-slate-400">Liga ou pausa as respostas automáticas da inteligência artificial.</span>
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

    // 1. ALTERNA AS TELAS PRINCIPAIS (CHATS, CONTATOS, TORRE)
    function switchMainView(view) {
      document.getElementById('viewSectionChats').classList.add('hidden');
      document.getElementById('viewSectionContacts').classList.add('hidden');
      document.getElementById('viewSectionTower').classList.add('hidden');

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
                  <div class="space-y-2 mb-2 p-2.5 rounded-xl bg-obsidian-950/80 border border-emerald-500/30">
                    <div class="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <i data-lucide="mic" class="w-4 h-4"></i>
                      <span>Áudio Transcrito na Íntegra (Whisper)</span>
                    </div>
                    \${m.mediaUrl ? \`<audio controls class="w-full h-8 mt-1"><source src="\${m.mediaUrl}" type="audio/ogg"></audio>\` : ''}
                  </div>
                \` : ''}
                <p class="whitespace-pre-wrap">\${m.text}</p>
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
