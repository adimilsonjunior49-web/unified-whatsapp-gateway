const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'src', 'presentation', 'routes', 'dashboardRoutes.ts');

const code = `import { FastifyInstance, FastifyPluginOptions } from 'fastify';
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
      description: 'Painel Executivo WhatsApp, Grupos Loggi, Feed de Menções, Notícias de Mercado e IA, e Torre de Controle',
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
  return \`<!DOCTYPE html>
<html lang="pt-BR" class="dark theme-night-clear">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Atlas Loggi | Command Center, Feed de Grupos & Inteligência de Mercado</title>
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

  <!-- HTML5 QR Code & Barcode Scanner Library via Webcam -->
  <script src="https://unpkg.com/html5-qrcode"></script>

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
    body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; transition: background 0.6s ease, color 0.6s ease; }
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
      transition: all 0.3s ease;
    }
    .glass-card-hover:hover {
      background: rgba(26, 34, 52, 0.85);
      border-color: rgba(14, 165, 233, 0.3);
    }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #0ea5e933; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #0ea5e977; }

    /* ========================================================================= */
    /* MOTOR DE TEMAS CLIMÁTICOS & TEMPORAIS DINÂMICOS                           */
    /* ========================================================================= */
    
    /* 1. NOITE COM CHUVA (Night Rain) */
    body.theme-night-rain {
      background: radial-gradient(circle at 50% 0%, #0d1e33 0%, #060b13 100%) !important;
      color: #e2e8f0;
    }
    body.theme-night-rain .glass-card {
      background: rgba(10, 20, 36, 0.85) !important;
      border-color: rgba(56, 189, 248, 0.22) !important;
      box-shadow: 0 8px 30px rgba(2, 132, 199, 0.12) !important;
    }
    body.theme-night-rain #adaptiveTopBar {
      background: rgba(8, 14, 24, 0.95);
      border-color: rgba(56, 189, 248, 0.25);
    }

    /* 2. NOITE LIMPA / ESTRELADA (Night Clear) */
    body.theme-night-clear {
      background: radial-gradient(circle at 50% 0%, #0f172a 0%, #07090e 100%) !important;
      color: #f1f5f9;
    }
    body.theme-night-clear .glass-card {
      background: rgba(15, 23, 42, 0.78) !important;
      border-color: rgba(255, 255, 255, 0.08) !important;
    }

    /* 3. DIA ENSOLARADO (Day Sunny) */
    body.theme-day-sunny {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #f8fafc 100%) !important;
      color: #0f172a !important;
    }
    body.theme-day-sunny .glass-rail {
      background: rgba(255, 255, 255, 0.94) !important;
      border-right-color: rgba(14, 165, 233, 0.2) !important;
    }
    body.theme-day-sunny .glass-card {
      background: rgba(255, 255, 255, 0.92) !important;
      border-color: rgba(14, 165, 233, 0.22) !important;
      box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.12) !important;
      color: #0f172a !important;
    }
    body.theme-day-sunny .text-white { color: #0f172a !important; }
    body.theme-day-sunny .text-slate-400 { color: #475569 !important; }
    body.theme-day-sunny .text-slate-300 { color: #334155 !important; }
    body.theme-day-sunny .bg-obsidian-950 { background-color: #f1f5f9 !important; }
    body.theme-day-sunny .bg-obsidian-900 { background-color: #ffffff !important; }
    body.theme-day-sunny .bg-obsidian-850 { background-color: #f8fafc !important; }
    body.theme-day-sunny #adaptiveTopBar {
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(14, 165, 233, 0.2);
    }

    /* 4. DIA CHUVOSO (Day Rain) */
    body.theme-day-rain {
      background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%) !important;
      color: #0f172a !important;
    }
    body.theme-day-rain .glass-card {
      background: rgba(241, 245, 249, 0.92) !important;
      border-color: rgba(100, 116, 139, 0.35) !important;
    }
    body.theme-day-rain .text-white { color: #0f172a !important; }

    /* 5. PÔR DO SOL / TARDE (Sunset Afternoon - Golden Hour) */
    body.theme-sunset-afternoon {
      background: radial-gradient(circle at 60% 0%, #311347 0%, #1c1538 35%, #0d111e 100%) !important;
      color: #fdf4ff !important;
    }
    body.theme-sunset-afternoon .glass-card {
      background: rgba(36, 23, 56, 0.8) !important;
      border-color: rgba(245, 158, 11, 0.25) !important;
      box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.12) !important;
    }
    body.theme-sunset-afternoon #adaptiveTopBar {
      background: rgba(26, 16, 42, 0.95);
      border-color: rgba(245, 158, 11, 0.3);
    }

    /* 6. TEMPESTADE SEVERA (Storm) */
    body.theme-storm {
      background: radial-gradient(circle at 50% 0%, #201a17 0%, #0a0808 100%) !important;
      color: #fafaf9 !important;
    }
    body.theme-storm .glass-card {
      background: rgba(28, 24, 24, 0.88) !important;
      border-color: rgba(239, 68, 68, 0.35) !important;
    }

    /* Destaque VIP de Menções nos Grupos */
    .mention-vip-card {
      border: 2px solid #f59e0b !important;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(19, 25, 38, 0.85) 100%) !important;
      box-shadow: 0 0 25px rgba(245, 158, 11, 0.25) !important;
      animation: pulseBorder 3s infinite alternate;
    }
    @keyframes pulseBorder {
      0% { border-color: rgba(245, 158, 11, 0.6); }
      100% { border-color: rgba(245, 158, 11, 1); }
    }
  </style>
</head>
<body class="bg-obsidian-950 text-slate-100 h-screen w-screen overflow-hidden flex antialiased selection:bg-loggi-500 selection:text-white relative">

  <!-- Canvas de Chuva Atmosférica Animada em 60fps -->
  <canvas id="rainCanvas" class="pointer-events-none fixed inset-0 z-10 hidden"></canvas>

  <!-- ========================================================================= -->
  <!-- 1. LEFT NAVIGATION RAIL (SLACK/LINEAR DOCK)                               -->
  <!-- ========================================================================= -->
  <aside class="w-16 sm:w-20 glass-rail flex flex-col items-center justify-between py-4 z-40 select-none">
    
    <!-- Top Branding -->
    <div class="flex flex-col items-center space-y-5">
      <div class="relative group cursor-pointer" onclick="switchMainView('chats')">
        <img src="/icon.svg" alt="Atlas Loggi" class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl shadow-xl shadow-loggi-500/20 object-contain p-1 bg-obsidian-900 border border-loggi-500/40 group-hover:scale-105 transition">
        <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-obsidian-950 flex items-center justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        </span>
      </div>

      <!-- Navigation Icons -->
      <nav class="flex flex-col space-y-2.5">
        
        <!-- Chats & Groups Button -->
        <button onclick="switchMainView('chats')" id="railBtnChats" class="rail-btn p-2.5 sm:p-3 rounded-2xl bg-loggi-500/20 text-loggi-400 border border-loggi-500/30 transition flex flex-col items-center group relative" title="Operações & Grupos Loggi">
          <i data-lucide="message-square" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Chats</span>
        </button>

        <!-- Saved Contacts Directory Button -->
        <button onclick="switchMainView('contacts')" id="railBtnContacts" class="rail-btn p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Agenda de Contatos Salvos">
          <i data-lucide="contact" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Contatos</span>
          <span id="railContactsBadge" class="absolute -top-1 -right-1 bg-emerald-500 text-obsidian-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full hidden">0</span>
        </button>

        <!-- NOVO: Consolidated Groups Feed & VIP Mentions -->
        <button onclick="switchMainView('groupfeed')" id="railBtnGroupFeed" class="rail-btn p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Feed Consolidado de Grupos & Menções VIP">
          <i data-lucide="bell-ring" class="w-5 h-5 text-amber-400"></i>
          <span class="text-[9px] font-bold mt-1">Grupos</span>
          <span id="railGroupMentionsBadge" class="absolute -top-1 -right-1 bg-amber-500 text-obsidian-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full hidden animate-pulse">0</span>
        </button>

        <!-- Group Operations Control Tower -->
        <button onclick="switchMainView('tower')" id="railBtnTower" class="rail-btn p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Torre de Controle Operacional Loggi">
          <i data-lucide="tower-control" class="w-5 h-5 text-sky-400"></i>
          <span class="text-[9px] font-bold mt-1">Torre</span>
        </button>

        <!-- Live Fleet Map (Leaflet) -->
        <button onclick="switchMainView('fleet')" id="railBtnFleet" class="rail-btn p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Mapa da Frota em Tempo Real">
          <i data-lucide="map" class="w-5 h-5 text-amber-400"></i>
          <span class="text-[9px] font-bold mt-1">Mapa</span>
        </button>

        <!-- Delivery Receipts & OCR -->
        <button onclick="switchMainView('receipts')" id="railBtnReceipts" class="rail-btn p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Canhotos & Comprovantes OCR">
          <i data-lucide="file-check-2" class="w-5 h-5 text-emerald-400"></i>
          <span class="text-[9px] font-bold mt-1">Canhotos</span>
        </button>

        <!-- Telephony / Softphone WebRTC -->
        <button onclick="switchMainView('telephony')" id="railBtnTelephony" class="rail-btn p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Telefonia & Discador WebRTC">
          <i data-lucide="phone-call" class="w-5 h-5 text-cyan-400"></i>
          <span class="text-[9px] font-bold mt-1">Telefone</span>
        </button>

        <!-- NOVO: Radar News & AI Intelligence -->
        <button onclick="switchMainView('news')" id="railBtnNews" class="rail-btn p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Radar News & Mercado de Atuação & IA">
          <i data-lucide="newspaper" class="w-5 h-5 text-purple-400"></i>
          <span class="text-[9px] font-bold mt-1">News</span>
        </button>

        <!-- Barcode & QR Scanner via Webcam -->
        <button onclick="openScannerModal()" class="p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-emerald-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Escanear Código de Barras / Danfe com Webcam">
          <i data-lucide="scan-barcode" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Scanner</span>
        </button>

        <!-- Video Conference & Meeting -->
        <button onclick="openMeetingModal()" class="p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-indigo-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Criar Teleconferência / Videoconferência">
          <i data-lucide="video" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Vídeo</span>
        </button>

        <!-- Telegram Bridge -->
        <a href="https://t.me/AtlasJuniorBot" target="_blank" class="p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-sky-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Abrir Torre Telegram (@AtlasJuniorBot)">
          <i data-lucide="send" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Telegram</span>
        </a>

        <!-- Global AI Toggle -->
        <button onclick="toggleGlobalAI()" id="railBtnAI" class="p-2.5 sm:p-3 rounded-2xl text-emerald-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Alternar IA Autônoma">
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
  <!-- 2. WORKSPACE WRAPPER COM TOPBAR ADAPTATIVO                                -->
  <!-- ========================================================================= -->
  <div class="flex-1 flex flex-col overflow-hidden relative z-20">

    <!-- --------------------------------------------------------------------- -->
    <!-- TOPBAR ADAPTATIVO: HORÁRIO REAL, PREVISÃO DO TEMPO & SELETOR DE TEMAS -->
    <!-- --------------------------------------------------------------------- -->
    <header id="adaptiveTopBar" class="h-12 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between text-xs transition-colors duration-500 z-30 select-none">
      
      <!-- Data e Hora em Tempo Real -->
      <div class="flex items-center space-x-3">
        <span class="flex items-center gap-1.5 font-bold tracking-wide">
          <i data-lucide="clock" class="w-4 h-4 text-sky-400"></i>
          <span id="liveCurrentTime" class="font-mono text-white text-sm font-extrabold">--:--:--</span>
        </span>
        <span class="text-slate-500 hidden md:inline">|</span>
        <span id="liveCurrentDate" class="text-slate-300 font-medium hidden md:inline">Carregando data...</span>
      </div>

      <!-- Badge Meteorológico em Tempo Real & Alerta de Pista -->
      <div class="flex items-center space-x-2 sm:space-x-3">
        <div id="weatherBadge" class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-sky-500/30 bg-sky-500/10 text-sky-300 transition-all cursor-pointer hover:bg-sky-500/20" onclick="fetchLiveWeather(true)" title="Clique para atualizar previsão meteorológica agora">
          <span id="weatherIconDisplay">⛅</span>
          <span id="weatherTempDisplay" class="font-bold">21°C</span>
          <span id="weatherConditionDisplay" class="hidden sm:inline">Cajamar / SP</span>
          <span id="weatherWetRoadAlert" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> PISTA MOLHADA
          </span>
        </div>

        <!-- Seletor de Simulação / Teste Rápido de Clima & Hora -->
        <div class="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10">
          <button onclick="setThemeOverride('auto')" id="themeBtn-auto" class="theme-pill px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-500 text-white" title="Automático em Tempo Real (Open-Meteo & Horário)">⚡ Auto</button>
          <button onclick="setThemeOverride('day-sunny')" id="themeBtn-day-sunny" class="theme-pill px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white" title="Dia Ensolarado (Morning / Sun)">☀️ Sol</button>
          <button onclick="setThemeOverride('sunset-afternoon')" id="themeBtn-sunset-afternoon" class="theme-pill px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white" title="Pôr do Sol / Entardecer (Golden Hour)">🌅 Tarde</button>
          <button onclick="setThemeOverride('night-clear')" id="themeBtn-night-clear" class="theme-pill px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white" title="Noite Limpa Estrelada">🌙 Noite</button>
          <button onclick="setThemeOverride('night-rain')" id="themeBtn-night-rain" class="theme-pill px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white" title="Noite Chuvosa Operacional">🌧️ Chuva</button>
          <button onclick="setThemeOverride('storm')" id="themeBtn-storm" class="theme-pill px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white" title="Tempestade Severa com Raios">⛈️ Raio</button>
        </div>
      </div>
    </header>

    <!-- --------------------------------------------------------------------- -->
    <!-- CONTENT CONTAINER (AS TELAS DO SISTEMA)                                -->
    <!-- --------------------------------------------------------------------- -->
    <div class="flex-1 flex overflow-hidden relative">

      <!-- =================================================================== -->
      <!-- VIEW A: OPERAÇÕES LOGGI & CENTRAL DE MENSAGENS                     -->
      <!-- =================================================================== -->
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

            <!-- Busca -->
            <div class="relative">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
              <input type="text" id="chatSearchInput" oninput="filterChats()" placeholder="Buscar grupos, motoristas ou cidades..." class="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-loggi-500 transition">
            </div>

            <!-- Abas Rápidas de Categoria: LOGGI vs PESSOAL -->
            <div class="grid grid-cols-2 gap-2 bg-obsidian-950 p-1 rounded-xl border border-slate-800">
              <button onclick="switchCategoryTab('LOGGI')" id="tabBtnLoggi" class="py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-loggi-600 text-white shadow-md shadow-loggi-600/30">
                <i data-lucide="package" class="w-3.5 h-3.5"></i> Loggi / Operações
              </button>
              <button onclick="switchCategoryTab('PESSOAL')" id="tabBtnPessoal" class="py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-white">
                <i data-lucide="user" class="w-3.5 h-3.5"></i> Pessoal
              </button>
            </div>
          </div>

          <!-- Chat Items Scroll Container -->
          <div id="chatListContainer" class="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            <div class="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
              <i data-lucide="loader" class="w-5 h-5 animate-spin text-loggi-400"></i>
              <span>Carregando conversas do WhatsApp Master...</span>
            </div>
          </div>
        </div>

        <!-- ÁREA CENTRAL DE CONVERSA / CHAT ATIVO -->
        <div id="activeChatArea" class="flex-1 flex flex-col bg-obsidian-950/70 h-full relative">
          
          <!-- Nenhum Chat Selecionado (Placeholder) -->
          <div id="noChatSelectedPlaceholder" class="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div class="w-16 h-16 rounded-3xl bg-obsidian-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-xl">
              <i data-lucide="message-square-dashed" class="w-8 h-8 text-loggi-400"></i>
            </div>
            <div>
              <h3 class="text-base font-extrabold text-white">Central Operacional Loggi</h3>
              <p class="text-xs text-slate-400 max-w-sm mt-1">Selecione uma conversa ou grupo ao lado para visualizar mensagens, áudios transcritos e despachar com o WhatsApp Master.</p>
            </div>
          </div>

          <!-- Janela do Chat Ativo -->
          <div id="chatActiveWindow" class="hidden flex-1 flex flex-col h-full overflow-hidden">
            
            <!-- Chat Header -->
            <div class="p-4 border-b border-slate-800/80 bg-obsidian-900/40 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div id="activeChatAvatar" class="w-10 h-10 rounded-2xl bg-loggi-600/20 text-loggi-400 border border-loggi-500/30 flex items-center justify-center font-bold text-sm">
                  LG
                </div>
                <div>
                  <h3 id="activeChatTitle" class="text-sm font-extrabold text-white flex items-center gap-2">Grupo Loggi</h3>
                  <div class="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span id="activeChatJidBadge" class="font-mono text-[10px] text-slate-500">jid</span>
                    <span>•</span>
                    <span id="activeChatCategoryBadge" class="px-2 py-0.2 rounded-full text-[9px] font-bold bg-loggi-500/20 text-loggi-400">LOGGI</span>
                  </div>
                </div>
              </div>

              <!-- Chat Header Actions -->
              <div class="flex items-center space-x-2">
                <button onclick="toggleActiveChatAi()" id="btnToggleChatAi" class="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-800 bg-obsidian-900 text-slate-300 hover:text-white transition flex items-center gap-1.5">
                  <i data-lucide="bot" class="w-3.5 h-3.5 text-emerald-400"></i>
                  <span id="chatAiStateLabel">IA Ativa</span>
                </button>
                <button onclick="requestActiveChatSummary()" class="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-800 bg-obsidian-900 text-slate-300 hover:text-sky-400 transition flex items-center gap-1.5" title="Gerar Resumo Executivo das Últimas Mensagens">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                  <span>Resumo IA</span>
                </button>
              </div>
            </div>

            <!-- Messages Timeline Container -->
            <div id="messagesTimeline" class="flex-1 overflow-y-auto p-4 space-y-3">
              <!-- Mensagens renderizadas dinamicamente aqui -->
            </div>

            <!-- Smart Replies Sugestões -->
            <div id="smartRepliesBar" class="px-4 py-2 border-t border-slate-800/60 bg-obsidian-900/30 flex items-center space-x-2 overflow-x-auto text-xs hidden">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                <i data-lucide="zap" class="w-3 h-3 text-amber-400"></i> Resposta Rápida:
              </span>
              <div id="smartRepliesChips" class="flex items-center space-x-2"></div>
            </div>

            <!-- Chat Input Box -->
            <div class="p-3 border-t border-slate-800/80 bg-obsidian-900/60 flex items-center space-x-2">
              <button onclick="toggleAudioRecording()" id="btnRecordAudio" class="p-2.5 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition" title="Gravar Nota de Voz PTT">
                <i data-lucide="mic" class="w-4 h-4"></i>
              </button>
              
              <input type="text" id="chatMessageInput" onkeydown="if(event.key === 'Enter') sendActiveChatMessage()" placeholder="Digite uma mensagem ou resposta operacional..." class="flex-1 bg-obsidian-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-loggi-500 transition">

              <button onclick="sendActiveChatMessage()" class="px-4 py-2.5 bg-loggi-600 hover:bg-loggi-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-loggi-600/30">
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">Enviar</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      <!-- =================================================================== -->
      <!-- VIEW B: AGENDA DE CONTATOS SALVOS                                   -->
      <!-- =================================================================== -->
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

      <!-- =================================================================== -->
      <!-- VIEW NOVO: PAINEL CONSOLIDADO DE GRUPOS & MENÇÕES VIP              -->
      <!-- =================================================================== -->
      <div id="viewSectionGroupFeed" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-hidden space-y-4">
        
        <!-- Header do Feed Consolidado -->
        <div class="border-b border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <i data-lucide="bell-ring" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-extrabold text-white">Feed Unificado de Grupos & Menções VIP</h2>
                <span id="groupFeedMentionsBadgeHeader" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> 0 MENÇÕES DIRETAS
                </span>
              </div>
              <p class="text-xs text-slate-400">Stream contínuo de todos os 47 grupos Loggi com destaque prioritário para onde você for marcado.</p>
            </div>
          </div>

          <!-- Filtros de Menção & Busca -->
          <div class="flex items-center space-x-2">
            <button onclick="toggleGroupMentionFilter(false)" id="btnGroupFilterAll" class="px-3 py-1.5 bg-amber-500 text-obsidian-950 font-extrabold text-xs rounded-xl transition">Todas as Mensagens</button>
            <button onclick="toggleGroupMentionFilter(true)" id="btnGroupFilterMentions" class="px-3 py-1.5 bg-obsidian-850 text-slate-300 hover:text-white border border-slate-800 font-extrabold text-xs rounded-xl transition flex items-center gap-1">
              <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-amber-400"></i> Apenas Onde Fui Marcado
            </button>
            <button onclick="loadGroupFeed()" class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition" title="Atualizar Feed de Grupos">
              <i data-lucide="rotate-cw" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Barra de Busca no Feed de Grupos -->
        <div class="relative w-full">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
          <input type="text" id="groupFeedSearchInput" oninput="loadGroupFeed()" placeholder="Filtrar por grupo, remetente ou palavra-chave..." class="w-full bg-obsidian-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition">
        </div>

        <!-- Lista de Mensagens Consolidadas de Todos os Grupos -->
        <div id="groupFeedMessagesContainer" class="flex-1 overflow-y-auto space-y-3 pr-1">
          <div class="text-center py-12 text-slate-500 text-xs">Carregando feed consolidado de grupos...</div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- VIEW C: TORRE DE CONTROLE ANALÍTICA GERAL (PAINÉIS & FARÓIS LOGGI) -->
      <!-- =================================================================== -->
      <div id="viewSectionTower" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
        
        <!-- Tower Header & Actions -->
        <div class="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shadow-lg shadow-sky-500/10">
              <i data-lucide="tower-control" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-extrabold text-white">Torre de Controle Operacional Loggi</h2>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> FAROL VERDE REGULAR
                </span>
              </div>
              <p class="text-xs text-slate-400">Monitoramento consolidado de 47 grupos Loggi, rotas interestaduais, SLA e inteligência de contingência.</p>
            </div>
          </div>

          <!-- Quick Tower Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="triggerManualBackup()" id="btnBackup" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition" title="Gerar Backup Atômico do SQLite">
              <i data-lucide="database" class="w-4 h-4 text-sky-400"></i> Backup DB
            </button>
            <button onclick="window.open('/tower/report-html', '_blank')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition" title="Exportar Relatório Consolidado para PDF / Impressão">
              <i data-lucide="printer" class="w-4 h-4 text-emerald-400"></i> Relatório PDF
            </button>
            <button onclick="openRedAlertModal()" class="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-rose-600/30">
              <i data-lucide="alert-triangle" class="w-4 h-4"></i> Alerta Vermelho Plantão
            </button>
          </div>
        </div>

        <!-- 1. SEMAFORIZAÇÃO EXECUTIVA POR FARÓIS (BEACONS) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Farol 1: Operação Geral -->
          <div class="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/10">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-400">Farol Geral de Malha</span>
              <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <div class="text-lg font-black text-emerald-400" id="beaconGlobalLabel">OPERAÇÃO 100% REGULAR</div>
            <p class="text-[11px] text-slate-400 mt-1">Carretas de transferência SP-RJ e SP-Curitiba fluindo no horário previsto.</p>
          </div>

          <!-- Farol 2: WhatsApp Master -->
          <div class="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/10">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-400">Conexão WhatsApp Master</span>
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>
            </div>
            <div class="text-lg font-black text-emerald-400">+55 11 97625-8311</div>
            <p class="text-[11px] text-slate-400 mt-1">Sessão ativa e sincronizando grupos e agenda em tempo real.</p>
          </div>

          <!-- Farol 3: SLA & Resposta -->
          <div class="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/10">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-400">SLA Médio de Atendimento</span>
              <i data-lucide="timer" class="w-4 h-4 text-emerald-400"></i>
            </div>
            <div class="text-lg font-black text-white">3.4 min</div>
            <p class="text-[11px] text-emerald-400 mt-1 font-bold">98.8% das solicitações dentro da meta</p>
          </div>

          <!-- Farol 4: IA & RAG Despachante -->
          <div class="glass-card rounded-2xl p-4 border border-sky-500/30 bg-sky-950/10">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-400">Despachante IA (RAG)</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400">ATIVO</span>
            </div>
            <div class="text-lg font-black text-sky-400">Base Loggi RAG</div>
            <p class="text-[11px] text-slate-400 mt-1">Respostas humanizadas sem rótulos robóticos para contatos Loggi.</p>
          </div>
        </div>

        <!-- 2. PAINÉIS DOS POLOS REGIONAIS DA MALHA LOGGI -->
        <div>
          <h3 class="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
            <i data-lucide="warehouse" class="w-4 h-4 text-sky-400"></i>
            Painéis Regionais & Status de Expedição das Docas
          </h3>
          <div id="hubsCardsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Hubs renderizados via JavaScript -->
          </div>
        </div>

        <!-- 3. RADAR DE INCIDENTES & TRANSMISSÃO EM LOTE -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Coluna 1 & 2: Radar de Incidentes Operacionais -->
          <div class="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
                <i data-lucide="radio" class="w-4 h-4 text-amber-400"></i>
                Radar de Alertas Operacionais (Rodovias & Polos)
              </h3>
              <span class="text-xs text-slate-400">Últimos eventos captados</span>
            </div>
            
            <div id="incidentsList" class="space-y-2 text-xs">
              <!-- Incidentes operacionais -->
            </div>
          </div>

          <!-- Coluna 3: Transmissão em Lote para Todos os Grupos (Broadcast) -->
          <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
              <i data-lucide="megaphone" class="w-4 h-4 text-sky-400"></i>
              Comunicado Geral para os 47 Grupos
            </h3>
            <p class="text-xs text-slate-400">Dispare um aviso operacional instantâneo para todos os grupos Loggi simultaneamente.</p>
            <textarea id="broadcastTextInput" rows="4" placeholder="Ex: Atenção motoristas: neblina na Serra das Araras. Reduzam velocidade." class="w-full bg-obsidian-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"></textarea>
            <button onclick="sendBroadcastToAllGroups()" id="btnBroadcastSend" class="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/20">
              <i data-lucide="send" class="w-4 h-4"></i> Transmitir para Todos os Grupos
            </button>
          </div>
        </div>

      </div>

      <!-- =================================================================== -->
      <!-- VIEW D: MAPA DA FROTA EM TEMPO REAL (LEAFLET / LOGISTICS)           -->
      <!-- =================================================================== -->
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
            <button onclick="refreshFleetLocations()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition font-semibold">
              <i data-lucide="rotate-cw" class="w-3.5 h-3.5 text-amber-400"></i> Atualizar Posições
            </button>
          </div>
        </div>

        <!-- Container do Mapa Leaflet -->
        <div class="flex-1 w-full rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl min-h-[450px]">
          <div id="fleetMapContainer" class="w-full h-full bg-obsidian-900 z-10"></div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- VIEW E: CANHOTOS & COMPROVANTES DE ENTREGA (OCR)                    -->
      <!-- =================================================================== -->
      <div id="viewSectionReceipts" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
        <div class="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <i data-lucide="file-check-2" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-extrabold text-white">Canhotos & Comprovantes OCR</h2>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">AUDITORIA ATIVA</span>
              </div>
              <p class="text-xs text-slate-400">Reconhecimento ótico (OCR) de notas fiscais, assinaturas e baixas de entrega.</p>
            </div>
          </div>

          <button onclick="loadReceiptsList()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-emerald-400"></i> Atualizar Lista
          </button>
        </div>

        <!-- Upload Manual para OCR -->
        <div class="glass-card rounded-2xl p-5 border border-dashed border-emerald-500/30 flex flex-col items-center justify-center space-y-3 bg-obsidian-900/40">
          <i data-lucide="upload-cloud" class="w-8 h-8 text-emerald-400"></i>
          <div class="text-center">
            <span class="text-sm font-bold text-white block">Enviar Imagem de Canhoto para Reconhecimento OCR</span>
            <span class="text-xs text-slate-400">Suporta JPG, PNG e WebP com extração instantânea de número de nota fiscal e recebedor</span>
          </div>
          <input type="file" id="receiptFileInput" accept="image/*" class="hidden" onchange="uploadReceiptForOCR(event)">
          <button onclick="document.getElementById('receiptFileInput').click()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2">
            <i data-lucide="file-up" class="w-4 h-4"></i> Selecionar Imagem do Canhoto
          </button>
        </div>

        <!-- Tabela de Comprovantes Auditados -->
        <div class="glass-card rounded-2xl p-4 border border-slate-800">
          <h3 class="text-sm font-extrabold text-white mb-3">Últimos Canhotos Reconhecidos pelo OCR</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-slate-400 border-b border-slate-800">
                  <th class="pb-2 font-semibold">Horário</th>
                  <th class="pb-2 font-semibold">Nota Fiscal</th>
                  <th class="pb-2 font-semibold">Motorista / Remetente</th>
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

      <!-- =================================================================== -->
      <!-- VIEW F: TELEFONIA EXECUTIVA & DISCADOR WEBRTC (SOFTPHONE)           -->
      <!-- =================================================================== -->
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
              <span id="dialerDisplay" class="font-mono text-xl text-white font-extrabold tracking-wider">--</span>
              <button onclick="clearDialer()" class="text-slate-400 hover:text-rose-400 transition">
                <i data-lucide="delete" class="w-5 h-5"></i>
              </button>
            </div>

            <!-- Grade Numérica DTMF -->
            <div class="grid grid-cols-3 gap-3 w-full">
              <button onclick="pressDtmf('1')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">1<span class="text-[9px] text-slate-500 font-normal">.</span></button>
              <button onclick="pressDtmf('2')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">2<span class="text-[9px] text-slate-500 font-normal">ABC</span></button>
              <button onclick="pressDtmf('3')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">3<span class="text-[9px] text-slate-500 font-normal">DEF</span></button>
              
              <button onclick="pressDtmf('4')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">4<span class="text-[9px] text-slate-500 font-normal">GHI</span></button>
              <button onclick="pressDtmf('5')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">5<span class="text-[9px] text-slate-500 font-normal">JKL</span></button>
              <button onclick="pressDtmf('6')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">6<span class="text-[9px] text-slate-500 font-normal">MNO</span></button>
              
              <button onclick="pressDtmf('7')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">7<span class="text-[9px] text-slate-500 font-normal">PQRS</span></button>
              <button onclick="pressDtmf('8')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">8<span class="text-[9px] text-slate-500 font-normal">TUV</span></button>
              <button onclick="pressDtmf('9')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">9<span class="text-[9px] text-slate-500 font-normal">WXYZ</span></button>
              
              <button onclick="pressDtmf('*')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">*</button>
              <button onclick="pressDtmf('0')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">0<span class="text-[9px] text-slate-500 font-normal">+</span></button>
              <button onclick="pressDtmf('#')" class="dial-btn h-14 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-800 text-lg font-bold text-white transition flex flex-col items-center justify-center">#</button>
            </div>

            <!-- Botão de Chamar / Desligar -->
            <div class="flex items-center space-x-4 w-full pt-2">
              <button id="btnStartCall" onclick="startWebRtcCall()" class="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition">
                <i data-lucide="phone" class="w-5 h-5"></i> Ligar
              </button>
              <button id="btnEndCall" onclick="endWebRtcCall()" class="hidden flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition">
                <i data-lucide="phone-off" class="w-5 h-5"></i> Desligar
              </button>
            </div>
          </div>

          <!-- Status da Linha & Histórico de Chamadas -->
          <div class="md:col-span-2 space-y-4">
            <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-white">Status da Chamada em Tempo Real</span>
                <span id="callStatusBadge" class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400">Em Espera</span>
              </div>
              <div class="p-4 bg-obsidian-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <span id="callRemoteParty" class="font-bold text-sm text-white block">Central de Operações Loggi</span>
                    <span class="text-xs text-slate-400">Codec Opus 48kHz HD Audio • Latência: 18ms</span>
                  </div>
                </div>
                <span id="callDuration" class="font-mono text-lg font-extrabold text-cyan-400">00:00</span>
              </div>
            </div>

            <div class="glass-card rounded-2xl p-5 border border-slate-800">
              <h3 class="text-sm font-extrabold text-white mb-3">Histórico Recente de Ligações</h3>
              <div id="callHistoryList" class="space-y-2 text-xs">
                <div class="p-3 bg-obsidian-950/60 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <i data-lucide="phone-incoming" class="w-4 h-4 text-emerald-400"></i>
                    <div>
                      <span class="font-bold text-white block">Motorista Ricardo - Carreta SP-RJ</span>
                      <span class="text-slate-400">Entrada na Doca 04 Cajamar</span>
                    </div>
                  </div>
                  <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">Concluída</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- VIEW G: RADAR NEWS & MERCADO DE ATUAÇÃO & IA (NOVA ABA)             -->
      <!-- =================================================================== -->
      <div id="viewSectionNews" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
        
        <!-- Header News -->
        <div class="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shadow-lg shadow-purple-500/10">
              <i data-lucide="newspaper" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-extrabold text-white">Radar News & Inteligência de Mercado</h2>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  FEED AO VIVO
                </span>
              </div>
              <p class="text-xs text-slate-400">Artigos estratégicos sobre malha logística, Loggi, inteligência artificial autônoma, Same-Day e regulação ANTT.</p>
            </div>
          </div>

          <!-- Busca nas Notícias -->
          <div class="flex items-center space-x-3 w-full md:w-auto">
            <div class="relative flex-1 md:w-64">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
              <input type="text" id="newsSearchInput" oninput="loadNewsArticles()" placeholder="Buscar notícias e inteligência..." class="w-full bg-obsidian-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition">
            </div>
            <button onclick="loadNewsArticles()" class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition" title="Recarregar Feed de Notícias">
              <i data-lucide="rotate-cw" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Filtros de Categoria News -->
        <div class="flex items-center space-x-2 text-xs font-semibold overflow-x-auto pb-1">
          <button onclick="setNewsCategory('ALL')" id="newsFilter-ALL" class="news-pill px-3 py-1.5 rounded-xl bg-purple-600 text-white transition">Todas as Notícias</button>
          <button onclick="setNewsCategory('LOGGI')" id="newsFilter-LOGGI" class="news-pill px-3 py-1.5 rounded-xl bg-obsidian-900 text-slate-400 hover:text-white border border-slate-800 transition">🚚 Logística & Loggi</button>
          <button onclick="setNewsCategory('AI')" id="newsFilter-AI" class="news-pill px-3 py-1.5 rounded-xl bg-obsidian-900 text-slate-400 hover:text-white border border-slate-800 transition">🤖 Inteligência Artificial</button>
          <button onclick="setNewsCategory('HIGHWAY')" id="newsFilter-HIGHWAY" class="news-pill px-3 py-1.5 rounded-xl bg-obsidian-900 text-slate-400 hover:text-white border border-slate-800 transition">🛣️ Rodovias & ANTT</button>
          <button onclick="setNewsCategory('TECH')" id="newsFilter-TECH" class="news-pill px-3 py-1.5 rounded-xl bg-obsidian-900 text-slate-400 hover:text-white border border-slate-800 transition">💡 Inovação & Tech</button>
        </div>

        <!-- Grid de Notícias Estruturadas -->
        <div id="newsCardsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="col-span-full text-center py-12 text-slate-500 text-xs">Carregando feed de inteligência de mercado...</div>
        </div>

      </div>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 1: SALVAR NOVO CONTATO NA AGENDA DO SQLITE                          -->
  <!-- ========================================================================= -->
  <div id="newContactModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-extrabold text-white text-base">Salvar Novo Contato na Agenda</h3>
        <button onclick="closeNewContactModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="text-slate-400 font-semibold block mb-1">Nome Completo / Identificação *</label>
          <input type="text" id="modalContactName" placeholder="Ex: Roberto - Motorista Carreta Cajamar" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition">
        </div>
        <div>
          <label class="text-slate-400 font-semibold block mb-1">Telefone WhatsApp (DDD + Número) *</label>
          <input type="text" id="modalContactPhone" placeholder="Ex: 11988887777 ou 5511988887777" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition">
        </div>
        <div>
          <label class="text-slate-400 font-semibold block mb-1">Categoria Operacional *</label>
          <select id="modalContactCategory" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition">
            <option value="LOGGI">Loggi / Operações Prioritárias (Respostas IA ativas)</option>
            <option value="PESSOAL">Pessoal / Particular (Sem IA automática)</option>
            <option value="PARCEIRO">Motorista / Transportador Parceiro</option>
          </select>
        </div>
        <div>
          <label class="text-slate-400 font-semibold block mb-1">Empresa / Base Loggi</label>
          <input type="text" id="modalContactCompany" placeholder="Ex: Loggi CD Cajamar / Doca 04" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition">
        </div>
        <div>
          <label class="text-slate-400 font-semibold block mb-1">Anotações / Rota</label>
          <textarea id="modalContactNotes" rows="2" placeholder="Ex: Rota Noturna SP -> Curitiba, carreta Volvo FH 540" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition"></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
        <button onclick="closeNewContactModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition text-xs">Cancelar</button>
        <button onclick="saveContactFromModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition text-xs flex items-center gap-1.5">
          <i data-lucide="check" class="w-4 h-4"></i> Salvar Contato
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 2: ALERTA VERMELHO DE PLANTÃO                                       -->
  <!-- ========================================================================= -->
  <div id="redAlertModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-rose-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <i data-lucide="alert-octagon" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-base">Alerta Vermelho de Plantão</h3>
            <p class="text-[11px] text-rose-400">Transmissão Crítica para a Supervisão</p>
          </div>
        </div>
        <button onclick="closeRedAlertModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="text-slate-400 font-semibold block mb-1">Motivo do Incidente Crítico *</label>
          <select id="redAlertReason" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 transition">
            <option value="BLOQUEIO_RODOVIA">Bloqueio Total de Rodovia (Acidente/Queda de Barreira)</option>
            <option value="AVARIA_CARRETA">Pane Mecânica / Sinistro de Carreta</option>
            <option value="QUEDA_SISTEMA">Lentidão / Falha em Sorter ou Sistema Central</option>
            <option value="CONDICOES_CLIMATICAS">Alagamento / Tempestade Severa em Polo</option>
            <option value="OUTRO">Outra Ocorrência de Alta Gravidade</option>
          </select>
        </div>

        <div>
          <label class="text-slate-400 font-semibold block mb-1">Local / Rodovia / Polo Atingido *</label>
          <input type="text" id="redAlertLocation" placeholder="Ex: Rod. Dutra km 184 sentido RJ ou CD Cajamar" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 transition">
        </div>

        <div>
          <label class="text-slate-400 font-semibold block mb-1">Detalhamento e Ações Imediatas *</label>
          <textarea id="redAlertDetails" rows="3" placeholder="Descreva os impactos na malha e rotas de desvio..." class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 transition"></textarea>
        </div>

        <div class="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-300 text-[11px]">
          <i data-lucide="bell" class="w-4 h-4 text-rose-400 flex-shrink-0"></i>
          <span>Este alerta notificará instantaneamente a diretoria no Telegram (@AtlasJuniorBot) e fixará o incidente no topo da Torre.</span>
        </div>
      </div>

      <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
        <button onclick="closeRedAlertModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition text-xs">Cancelar</button>
        <button onclick="submitRedAlert()" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30">
          <i data-lucide="radio" class="w-4 h-4"></i> Disparar Alerta Vermelho
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 3: SCANNER DE CÓDIGO DE BARRAS & DANFE VIA WEBCAM                   -->
  <!-- ========================================================================= -->
  <div id="scannerModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-emerald-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <i data-lucide="scan-barcode" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-base">Scanner de Encomendas & Danfe</h3>
            <p class="text-[11px] text-emerald-400">Leitor ótico 1D / 2D via Webcam do computador</p>
          </div>
        </div>
        <button onclick="closeScannerModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <div id="qr-reader" class="w-full rounded-2xl overflow-hidden border border-slate-800 bg-black min-h-[220px]"></div>

        <div id="scannerResultBox" class="p-3 bg-obsidian-950 border border-emerald-500/40 rounded-xl space-y-1">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Último Código Identificado:</span>
          <span id="scannedCodeText" class="font-mono text-emerald-400 font-bold text-sm block">Aguardando aproximação da etiqueta...</span>
        </div>

        <p class="text-[11px] text-slate-400">
          Aponte o código de barras da nota fiscal ou etiqueta de envio para a câmera. Ao detectar, o bipe sonoro confirmará a leitura.
        </p>
      </div>

      <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
        <button onclick="closeScannerModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition text-xs">Fechar Scanner</button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 4: LEITURA COMPLETA DE ARTIGO NEWS                                  -->
  <!-- ========================================================================= -->
  <div id="newsArticleModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <span id="newsModalBadge" class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400">LOGÍSTICA</span>
          <span id="newsModalDate" class="text-xs text-slate-400 font-mono">Hoje</span>
        </div>
        <button onclick="closeNewsModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
        <h2 id="newsModalTitle" class="text-lg font-black text-white leading-snug">Título da Matéria</h2>
        <div class="p-3 bg-obsidian-950 border border-slate-800 rounded-xl space-y-1">
          <span class="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Ponto-Chave de Impacto Operacional:</span>
          <p id="newsModalTakeaway" class="text-slate-200 font-medium">Impacto na malha</p>
        </div>
        <div id="newsModalContent" class="text-slate-300 leading-relaxed space-y-3 whitespace-pre-line text-[13px]">
          Conteúdo do artigo
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-800">
        <span id="newsModalSource" class="text-[11px] text-slate-500">Fonte: Radar Loggi</span>
        <button onclick="closeNewsModal()" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition text-xs">Fechar Leitura</button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL 5: SALA DE VIDEOCONFERÊNCIA LOGGI                                   -->
  <!-- ========================================================================= -->
  <div id="meetingModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-card bg-obsidian-900 border border-indigo-500/30 rounded-2xl w-full max-w-4xl p-6 space-y-4 shadow-2xl flex flex-col h-[85vh]">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <i data-lucide="video" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-base">Teleconferência Operacional Loggi</h3>
            <p class="text-[11px] text-indigo-400">Sala Segura WebRTC de Plantão</p>
          </div>
        </div>
        <button onclick="closeMeetingModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="flex-1 w-full rounded-2xl overflow-hidden border border-slate-800 bg-black">
        <iframe id="jitsiMeetingIframe" allow="camera; microphone; fullscreen; display-capture" class="w-full h-full border-0"></iframe>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <span class="text-slate-400">Link compartilhado com o plantão e polos regionais.</span>
        <button onclick="closeMeetingModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition">Sair da Reunião</button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- JAVASCRIPT MASTER: LOGGI ENGINE, CLIMA DINÂMICO, NOTÍCIAS & GRUPOS FEED   -->
  <!-- ========================================================================= -->
  <script>
    const SESSION_ID = 'whatsapp_principal';
    let allChats = [];
    let activeCategoryTab = 'LOGGI';
    let activeChatJid = null;
    let contactCategoryFilter = 'ALL';
    let leafletMapInstance = null;
    let currentDialerNumber = '';
    let currentMeetingRoom = 'atlas-loggi-' + Math.floor(100000 + Math.random() * 900000);

    // Estado do Clima & Temas
    let currentWeatherTheme = 'night-clear';
    let themeOverride = localStorage.getItem('atlas_theme_override') || 'auto';
    let rainCanvasActive = false;
    let rainAnimationId = null;

    // Estado do Feed de Grupos
    let groupFeedMentionOnly = false;
    let currentNewsList = [];
    let activeNewsCategory = 'ALL';

    // 1. ALTERNA AS TELAS PRINCIPAIS DO SISTEMA
    function switchMainView(view) {
      const views = ['chats', 'contacts', 'groupfeed', 'tower', 'fleet', 'receipts', 'telephony', 'news'];
      
      views.forEach(v => {
        const el = document.getElementById('viewSection' + v.charAt(0).toUpperCase() + v.slice(1));
        if (el) el.classList.add('hidden');
      });

      document.querySelectorAll('.rail-btn').forEach(b => {
        b.classList.remove('bg-loggi-500/20', 'text-loggi-400', 'border', 'border-loggi-500/30');
        b.classList.add('text-slate-400');
      });

      const activeBtn = document.getElementById('railBtn' + view.charAt(0).toUpperCase() + view.slice(1));
      if (activeBtn) {
        activeBtn.classList.add('bg-loggi-500/20', 'text-loggi-400', 'border', 'border-loggi-500/30');
        activeBtn.classList.remove('text-slate-400');
      }

      if (view === 'chats') {
        document.getElementById('viewSectionChats').classList.remove('hidden');
        loadChats();
      } else if (view === 'contacts') {
        document.getElementById('viewSectionContacts').classList.remove('hidden');
        loadContactsList();
      } else if (view === 'groupfeed') {
        document.getElementById('viewSectionGroupfeed').classList.remove('hidden');
        loadGroupFeed();
      } else if (view === 'tower') {
        document.getElementById('viewSectionTower').classList.remove('hidden');
        loadTowerData();
      } else if (view === 'fleet') {
        document.getElementById('viewSectionFleet').classList.remove('hidden');
        setTimeout(() => { initFleetMap(); }, 150);
      } else if (view === 'receipts') {
        document.getElementById('viewSectionReceipts').classList.remove('hidden');
        loadReceiptsList();
      } else if (view === 'telephony') {
        document.getElementById('viewSectionTelephony').classList.remove('hidden');
        loadCallHistory();
      } else if (view === 'news') {
        document.getElementById('viewSectionNews').classList.remove('hidden');
        loadNewsArticles();
      }
      lucide.createIcons();
    }

    // 2. RELÓGIO & DATA EM TEMPO REAL (SEGUNDOS AO VIVO)
    function startRealtimeClock() {
      function update() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR', { hour12: false });
        const dateStr = now.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        const timeEl = document.getElementById('liveCurrentTime');
        const dateEl = document.getElementById('liveCurrentDate');
        if (timeEl) timeEl.innerText = timeStr;
        if (dateEl) dateEl.innerText = capitalizedDate;
      }
      update();
      setInterval(update, 1000);
    }

    // 3. PREVISÃO DO TEMPO DINÂMICA & MOTOR DE TEMA ADAPTATIVO
    async function fetchLiveWeather(isUserClick = false) {
      try {
        const res = await fetch('/api/weather');
        const data = await res.json();
        if (data.success) {
          // Atualiza UI do Badge
          document.getElementById('weatherTempDisplay').innerText = data.temperature + '°C';
          document.getElementById('weatherConditionDisplay').innerText = data.conditionLabel + ' • Cajamar';

          let icon = '⛅';
          if (data.condition === 'clear') icon = data.isDay ? '☀️' : '🌙';
          else if (data.condition === 'rain') icon = '🌧️';
          else if (data.condition === 'storm') icon = '⛈️';
          else if (data.condition === 'fog') icon = '🌫️';
          document.getElementById('weatherIconDisplay').innerText = icon;

          // Alerta de Pista Molhada
          const wetRoadAlert = document.getElementById('weatherWetRoadAlert');
          if (data.wetRoadWarning) {
            wetRoadAlert.classList.remove('hidden');
          } else {
            wetRoadAlert.classList.add('hidden');
          }

          currentWeatherTheme = data.recommendedTheme || 'night-clear';

          // Aplica o tema se o usuário estiver no modo 'auto'
          if (themeOverride === 'auto') {
            applyPlatformTheme(currentWeatherTheme);
          }

          if (isUserClick) {
            sendWindowsDesktopNotification('⛅ Previsão do Tempo Atualizada', \`\${data.conditionLabel} em \${data.city} (\${data.temperature}°C). Alerta de pista: \${data.wetRoadWarning ? 'MOLHADA' : 'SECA'}.\`);
          }
        }
      } catch (e) {
        console.warn('Aviso ao buscar clima:', e);
      }
    }

    function setThemeOverride(theme) {
      themeOverride = theme;
      localStorage.setItem('atlas_theme_override', theme);

      // Atualiza botões
      document.querySelectorAll('.theme-pill').forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white');
        b.classList.add('text-slate-400');
      });
      const activeBtn = document.getElementById('themeBtn-' + theme);
      if (activeBtn) {
        activeBtn.classList.add('bg-sky-500', 'text-white');
        activeBtn.classList.remove('text-slate-400');
      }

      if (theme === 'auto') {
        applyPlatformTheme(currentWeatherTheme);
      } else {
        applyPlatformTheme(theme);
      }
    }

    function applyPlatformTheme(themeName) {
      document.body.className = document.body.className
        .replace(/theme-[a-z\-]+/g, '')
        .trim();
      document.body.classList.add('theme-' + themeName);

      // Controle do Canvas de Chuva
      if (themeName === 'night-rain' || themeName === 'day-rain' || themeName === 'storm') {
        startRainAnimation(themeName === 'storm' ? 160 : 80);
      } else {
        stopRainAnimation();
      }
    }

    // 4. MOTOR DE CHUVA ATMOSFÉRICA EM CANVAS 60FPS
    function startRainAnimation(dropCount = 90) {
      const canvas = document.getElementById('rainCanvas');
      if (!canvas) return;
      canvas.classList.remove('hidden');
      const ctx = canvas.getContext('2d');

      let width = canvas.width = window.innerWidth;
      let height = canvas.height = window.innerHeight;

      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });

      const drops = [];
      for (let i = 0; i < dropCount; i++) {
        drops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 20 + 10,
          speed: Math.random() * 10 + 12,
          opacity: Math.random() * 0.4 + 0.1
        });
      }

      if (rainAnimationId) cancelAnimationFrame(rainAnimationId);

      function loop() {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 2, d.y + d.length);

          d.y += d.speed;
          d.x -= 1;

          if (d.y > height) {
            d.y = -20;
            d.x = Math.random() * width;
          }
        }
        ctx.stroke();
        rainAnimationId = requestAnimationFrame(loop);
      }

      loop();
      rainCanvasActive = true;
    }

    function stopRainAnimation() {
      const canvas = document.getElementById('rainCanvas');
      if (canvas) canvas.classList.add('hidden');
      if (rainAnimationId) cancelAnimationFrame(rainAnimationId);
      rainCanvasActive = false;
    }

    // 5. NOVO: FEED CONSOLIDADO DE GRUPOS & MENÇÕES VIP
    async function loadGroupFeed() {
      const container = document.getElementById('groupFeedMessagesContainer');
      const search = document.getElementById('groupFeedSearchInput')?.value || '';
      try {
        const res = await fetch(\`/groups/consolidated-messages?mentionedOnly=\${groupFeedMentionOnly}&search=\${encodeURIComponent(search)}\`);
        const json = await res.json();
        
        if (json.success && Array.isArray(json.messages)) {
          // Atualiza contador de menções
          const badgeHeader = document.getElementById('groupFeedMentionsBadgeHeader');
          const railBadge = document.getElementById('railGroupMentionsBadge');
          if (json.totalMentions > 0) {
            badgeHeader.innerText = \`🚨 \${json.totalMentions} MENÇÕES DIRETAS\`;
            railBadge.innerText = json.totalMentions;
            railBadge.classList.remove('hidden');
          } else {
            badgeHeader.innerText = '0 MENÇÕES DIRETAS';
            railBadge.classList.add('hidden');
          }

          if (json.messages.length === 0) {
            container.innerHTML = '<div class="text-center py-12 text-slate-500 text-xs">Nenhuma mensagem encontrada para os filtros selecionados.</div>';
            return;
          }

          container.innerHTML = json.messages.map(m => {
            const isVip = m.isMentioned;
            const cardClass = isVip ? 'glass-card mention-vip-card rounded-2xl p-4' : 'glass-card rounded-2xl p-4 border border-slate-800';

            return \`
              <div class="\${cardClass} space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full \${isVip ? 'bg-amber-400 animate-ping' : 'bg-sky-500'}"></span>
                    <span class="font-extrabold text-white text-xs sm:text-sm">\${m.groupName}</span>
                    \${isVip ? '<span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-obsidian-950 flex items-center gap-1">🚨 VOCÊ FOI MARCADO</span>' : ''}
                  </div>
                  <span class="text-[11px] text-slate-400 font-mono">\${m.timeFormatted}</span>
                </div>

                <div class="text-xs text-slate-300">
                  <strong class="\${isVip ? 'text-amber-300' : 'text-sky-300'}">\${m.senderName}:</strong>
                  <span class="ml-1">\${m.text}</span>
                </div>

                <!-- Resposta Rápida Inline no Grupo -->
                <div class="pt-2 border-t border-white/5 flex items-center space-x-2">
                  <input type="text" id="inlineReplyInput-\${m.id}" placeholder="Responder rapidamente neste grupo..." class="flex-1 bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500">
                  <button onclick="sendGroupInlineReply('\${m.jid}', '\${m.id}')" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-bold text-xs rounded-xl flex items-center gap-1 transition">
                    <i data-lucide="send" class="w-3.5 h-3.5"></i> Responder
                  </button>
                </div>
              </div>
            \`;
          }).join('');

          lucide.createIcons();
        }
      } catch (e) {
        container.innerHTML = '<div class="text-center py-12 text-rose-400 text-xs">Erro ao carregar mensagens consolidadas de grupos.</div>';
      }
    }

    function toggleGroupMentionFilter(onlyMentions) {
      groupFeedMentionOnly = onlyMentions;
      const btnAll = document.getElementById('btnGroupFilterAll');
      const btnMentions = document.getElementById('btnGroupFilterMentions');

      if (onlyMentions) {
        btnMentions.className = 'px-3 py-1.5 bg-amber-500 text-obsidian-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1';
        btnAll.className = 'px-3 py-1.5 bg-obsidian-850 text-slate-300 hover:text-white border border-slate-800 font-extrabold text-xs rounded-xl transition';
      } else {
        btnAll.className = 'px-3 py-1.5 bg-amber-500 text-obsidian-950 font-extrabold text-xs rounded-xl transition';
        btnMentions.className = 'px-3 py-1.5 bg-obsidian-850 text-slate-300 hover:text-white border border-slate-800 font-extrabold text-xs rounded-xl transition flex items-center gap-1';
      }
      loadGroupFeed();
    }

    async function sendGroupInlineReply(jid, msgId) {
      const input = document.getElementById('inlineReplyInput-' + msgId);
      const text = input ? input.value.trim() : '';
      if (!text) return;

      try {
        const res = await fetch('/groups/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jid, text })
        });
        const json = await res.json();
        if (json.success) {
          input.value = '';
          alert('✅ Resposta despachada com sucesso no grupo!');
          loadGroupFeed();
        } else {
          alert('Erro ao enviar resposta no grupo.');
        }
      } catch (_) {
        alert('Erro de conexão ao enviar resposta.');
      }
    }

    // 6. NOVO: RADAR NEWS & MERCADO DE ATUAÇÃO & IA
    async function loadNewsArticles() {
      const grid = document.getElementById('newsCardsGrid');
      const search = document.getElementById('newsSearchInput')?.value || '';
      try {
        const res = await fetch(\`/api/news?category=\${activeNewsCategory}&search=\${encodeURIComponent(search)}\`);
        const json = await res.json();
        if (json.success && Array.isArray(json.articles)) {
          currentNewsList = json.articles;
          if (json.articles.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 text-xs">Nenhum artigo encontrado.</div>';
            return;
          }

          grid.innerHTML = json.articles.map(a => {
            return \`
              <div class="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/40 flex flex-col justify-between space-y-4 group transition">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-400">\${a.categoryLabel}</span>
                    <span class="text-[11px] text-slate-400 font-mono">\${a.readTime}</span>
                  </div>
                  <h3 class="font-extrabold text-white text-sm group-hover:text-purple-300 transition leading-snug">\${a.title}</h3>
                  <p class="text-xs text-slate-300 leading-relaxed">\${a.summary}</p>
                </div>

                <div class="space-y-3 pt-3 border-t border-slate-800">
                  <div class="p-2.5 bg-obsidian-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-300">
                    <strong class="text-purple-400">Impacto Loggi:</strong> \${a.keyTakeaway}
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] text-slate-500">\${a.publishedAt}</span>
                    <button onclick="openNewsArticleModal('\${a.id}')" class="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1">
                      Ler Artigo <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>
              </div>
            \`;
          }).join('');

          lucide.createIcons();
        }
      } catch (e) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-rose-400 text-xs">Erro ao carregar notícias.</div>';
      }
    }

    function setNewsCategory(cat) {
      activeNewsCategory = cat;
      document.querySelectorAll('.news-pill').forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white');
        b.classList.add('bg-obsidian-900', 'text-slate-400');
      });
      const activeBtn = document.getElementById('newsFilter-' + cat);
      if (activeBtn) {
        activeBtn.classList.add('bg-purple-600', 'text-white');
        activeBtn.classList.remove('bg-obsidian-900', 'text-slate-400');
      }
      loadNewsArticles();
    }

    function openNewsArticleModal(id) {
      const article = currentNewsList.find(a => a.id === id);
      if (!article) return;

      document.getElementById('newsModalBadge').innerText = article.categoryLabel;
      document.getElementById('newsModalDate').innerText = article.publishedAt;
      document.getElementById('newsModalTitle').innerText = article.title;
      document.getElementById('newsModalTakeaway').innerText = article.keyTakeaway;
      document.getElementById('newsModalContent').innerText = article.content;
      document.getElementById('newsModalSource').innerText = 'Fonte Oficial: ' + article.source;

      document.getElementById('newsArticleModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeNewsModal() {
      document.getElementById('newsArticleModal').classList.add('hidden');
    }

    // 7. CARREGA CONVERSAS E ABAS DO CHAT (LOGGI vs PESSOAL)
    function switchCategoryTab(cat) {
      activeCategoryTab = cat;
      const btnLoggi = document.getElementById('tabBtnLoggi');
      const btnPessoal = document.getElementById('tabBtnPessoal');

      if (cat === 'LOGGI') {
        btnLoggi.className = 'py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-loggi-600 text-white shadow-md shadow-loggi-600/30';
        btnPessoal.className = 'py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-white';
      } else {
        btnPessoal.className = 'py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-slate-700 text-white shadow-md shadow-slate-700/30';
        btnLoggi.className = 'py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-white';
      }
      filterChats();
    }

    async function loadChats() {
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
            <div class="w-10 h-10 rounded-2xl bg-obsidian-800 border border-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 flex-shrink-0">
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
    }

    async function sendActiveChatMessage() {
      const input = document.getElementById('chatMessageInput');
      const text = input ? input.value.trim() : '';
      if (!text || !activeChatJid) return;

      input.value = '';
      try {
        await fetch('/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: SESSION_ID,
            to: activeChatJid,
            text
          })
        });
        loadChatMessages(activeChatJid);
        loadChats();
      } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
      }
    }

    // 8. AGENDA DE CONTATOS DO SQLITE
    async function loadContactsList() {
      const search = document.getElementById('contactSearchInput')?.value || '';
      try {
        const res = await fetch(\`/contacts?category=\${contactCategoryFilter}&search=\${encodeURIComponent(search)}\`);
        const json = await res.json();
        const grid = document.getElementById('contactsCardsGrid');
        
        if (json.success && Array.isArray(json.data)) {
          document.getElementById('railContactsBadge').innerText = json.count || json.data.length;
          document.getElementById('railContactsBadge').classList.remove('hidden');

          if (json.data.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 text-xs">Nenhum contato encontrado.</div>';
            return;
          }

          grid.innerHTML = json.data.map(c => {
            const badgeColor = c.category === 'LOGGI' ? 'bg-loggi-500/20 text-loggi-400' : 'bg-slate-700/40 text-slate-300';
            return \`
              <div class="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2.5">
                    <div class="w-9 h-9 rounded-xl bg-obsidian-850 border border-slate-800 flex items-center justify-center font-bold text-xs text-white">
                      \${escapeHtml(c.name ? c.name.charAt(0).toUpperCase() : '?')}
                    </div>
                    <div>
                      <h4 class="font-extrabold text-white text-xs">\${escapeHtml(c.name || 'Sem Nome')}</h4>
                      <span class="text-[11px] text-slate-400 font-mono">\${c.phone || c.jid}</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold \${badgeColor}">\${c.category}</span>
                </div>

                <div class="text-[11px] text-slate-400 space-y-1">
                  \${c.company ? \`<div><strong class="text-slate-300">Base/Empresa:</strong> \${escapeHtml(c.company)}</div>\` : ''}
                  \${c.notes ? \`<div><strong class="text-slate-300">Observações:</strong> \${escapeHtml(c.notes)}</div>\` : ''}
                </div>

                <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button onclick="selectChat('\${c.jid}', '\${escapeHtml(c.name)}', '\${c.category}'); switchMainView('chats')" class="px-3 py-1 bg-loggi-600 hover:bg-loggi-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition">
                    <i data-lucide="message-circle" class="w-3.5 h-3.5"></i> Conversar
                  </button>
                </div>
              </div>
            \`;
          }).join('');

          lucide.createIcons();
        }
      } catch (err) {
        console.error('Erro ao buscar agenda:', err);
      }
    }

    function setContactCategoryFilter(cat) {
      contactCategoryFilter = cat;
      document.querySelectorAll('.pill-contact').forEach(b => {
        b.className = 'pill-contact px-3 py-1 rounded-lg bg-obsidian-850 text-slate-400 hover:text-white transition';
      });
      document.getElementById('pillContact-' + cat).className = 'pill-contact px-3 py-1 rounded-lg bg-emerald-500 text-white transition';
      loadContactsList();
    }

    function openNewContactModal() {
      document.getElementById('newContactModal').classList.remove('hidden');
    }
    function closeNewContactModal() {
      document.getElementById('newContactModal').classList.add('hidden');
    }

    async function saveContactFromModal() {
      const name = document.getElementById('modalContactName').value.trim();
      const phone = document.getElementById('modalContactPhone').value.trim();
      const category = document.getElementById('modalContactCategory').value;
      const company = document.getElementById('modalContactCompany').value.trim();
      const notes = document.getElementById('modalContactNotes').value.trim();

      if (!name || !phone) {
        alert('Preencha pelo menos Nome e Telefone.');
        return;
      }

      try {
        const res = await fetch('/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, category, company, notes })
        });
        const json = await res.json();
        if (json.success) {
          closeNewContactModal();
          loadContactsList();
          loadChats();
          alert('Contato salvo com sucesso na agenda SQLite!');
        }
      } catch (err) {
        alert('Erro ao salvar contato.');
      }
    }

    // 9. TORRE DE CONTROLE, POLOS E TRANSMISSÃO EM LOTE
    async function loadTowerData() {
      try {
        const res = await fetch('/tower/metrics');
        const json = await res.json();
        if (json.success) {
          // Renderiza Polos Regionais
          const hubsGrid = document.getElementById('hubsCardsGrid');
          if (hubsGrid && Array.isArray(json.hubs)) {
            hubsGrid.innerHTML = json.hubs.map(h => {
              const statusColor = h.statusColor || '#10b981';
              return \`
                <div class="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-extrabold text-white text-xs">\${h.name}</span>
                    <span class="w-2.5 h-2.5 rounded-full" style="background-color: \${statusColor}"></span>
                  </div>
                  <span class="text-[11px] text-slate-400 block">\${h.city}</span>
                  <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-1">
                    <div><strong>Grupos:</strong> \${h.activeGroups}</div>
                    <div><strong>Veículos:</strong> \${h.fleetCount}</div>
                  </div>
                </div>
              \`;
            }).join('');
          }

          // Renderiza Incidentes
          const incidentsList = document.getElementById('incidentsList');
          if (incidentsList && Array.isArray(json.incidents)) {
            incidentsList.innerHTML = json.incidents.map(i => {
              return \`
                <div class="p-3 bg-obsidian-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div class="space-y-0.5">
                    <span class="font-bold text-white text-xs block">\${i.sender}</span>
                    <span class="text-slate-300 text-[11px]">\${i.summary}</span>
                  </div>
                  <span class="text-[10px] text-slate-500 font-mono">\${i.time}</span>
                </div>
              \`;
            }).join('');
          }
        }
      } catch (err) {
        console.error('Erro ao carregar métricas da torre:', err);
      }
    }

    async function sendBroadcastToAllGroups() {
      const input = document.getElementById('broadcastTextInput');
      const text = input ? input.value.trim() : '';
      if (!text) {
        alert('Digite uma mensagem para transmitir.');
        return;
      }

      if (!confirm('Deseja transmitir este comunicado para TODOS os 47 grupos Loggi agora?')) return;

      const btn = document.getElementById('btnBroadcastSend');
      btn.disabled = true;
      btn.innerText = 'Transmitindo...';

      try {
        const res = await fetch('/tower/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const json = await res.json();
        if (json.success) {
          alert('✅ Comunicado disparado com sucesso para ' + json.totalGroups + ' grupos Loggi!');
          input.value = '';
        }
      } catch (e) {
        alert('Erro ao disparar transmissão.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Transmitir para Todos os Grupos';
        lucide.createIcons();
      }
    }

    function openRedAlertModal() { document.getElementById('redAlertModal').classList.remove('hidden'); }
    function closeRedAlertModal() { document.getElementById('redAlertModal').classList.add('hidden'); }

    async function submitRedAlert() {
      const reason = document.getElementById('redAlertReason').value;
      const location = document.getElementById('redAlertLocation').value.trim();
      const details = document.getElementById('redAlertDetails').value.trim();

      if (!location || !details) {
        alert('Preencha o local e os detalhes do incidente.');
        return;
      }

      try {
        const res = await fetch('/tower/red-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason, location, details })
        });
        const json = await res.json();
        if (json.success) {
          closeRedAlertModal();
          alert('🚨 ALERTA VERMELHO DISPARADO! Notificação enviada à Diretoria no Telegram (@AtlasJuniorBot).');
          loadTowerData();
        }
      } catch (_) {
        alert('Erro ao registrar alerta vermelho.');
      }
    }

    // 10. MAPA LEAFLET DA FROTA
    async function initFleetMap() {
      const container = document.getElementById('fleetMapContainer');
      if (!container) return;

      if (!leafletMapInstance) {
        leafletMapInstance = L.map('fleetMapContainer').setView([-23.4112, -46.8920], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(leafletMapInstance);
      }

      try {
        const res = await fetch('/logistics/fleet-live');
        const json = await res.json();
        if (json.success) {
          // Adiciona polos
          if (Array.isArray(json.hubs)) {
            json.hubs.forEach(h => {
              L.circleMarker([h.lat, h.lon], {
                radius: 10,
                fillColor: '#0ea5e9',
                color: '#ffffff',
                weight: 2,
                fillOpacity: 0.9
              }).addTo(leafletMapInstance).bindPopup(\`<b>\${h.name}</b><br>\${h.description}\`);
            });
          }

          // Adiciona veículos
          if (Array.isArray(json.vehicles)) {
            json.vehicles.forEach(v => {
              L.circleMarker([v.lat, v.lon], {
                radius: 7,
                fillColor: '#f59e0b',
                color: '#ffffff',
                weight: 1.5,
                fillOpacity: 0.9
              }).addTo(leafletMapInstance).bindPopup(\`<b>Veículo \${v.plate}</b><br>Motorista: \${v.driverName}<br>Rota: \${v.routeDescription}\`);
            });
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar dados do mapa:', e);
      }
    }

    function refreshFleetLocations() {
      initFleetMap();
    }

    // 11. CANHOTOS & OCR
    async function loadReceiptsList() {
      try {
        const res = await fetch('/logistics/receipts');
        const json = await res.json();
        const tbody = document.getElementById('receiptsTableBody');
        if (json.success && Array.isArray(json.receipts) && tbody) {
          tbody.innerHTML = json.receipts.map(r => {
            return \`
              <tr>
                <td class="py-3 text-slate-400 font-mono">\${formatTimestamp(r.created_at)}</td>
                <td class="py-3 font-mono font-bold text-emerald-400">\${r.nf_number || 'S/N'}</td>
                <td class="py-3 font-semibold text-white">\${r.driver_name || 'Motorista'}</td>
                <td class="py-3 text-slate-300">\${r.extracted_text || 'Comprovante auditado'}</td>
                <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">APROVADO</span></td>
              </tr>
            \`;
          }).join('');
        }
      } catch (e) {
        console.warn('Erro ao buscar canhotos:', e);
      }
    }

    async function uploadReceiptForOCR(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/logistics/ocr-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: reader.result })
          });
          const json = await res.json();
          if (json.success) {
            alert('✅ OCR Concluído! Nota Fiscal detectada: ' + json.data.nfNumber);
            loadReceiptsList();
          }
        } catch (_) {
          alert('Erro no processamento OCR.');
        }
      };
      reader.readAsDataURL(file);
    }

    // 12. TELEFONIA & SOFTPHONE
    function pressDtmf(char) {
      playDtmfTone(char);
      currentDialerNumber += char;
      document.getElementById('dialerDisplay').innerText = currentDialerNumber;
    }

    function clearDialer() {
      currentDialerNumber = '';
      document.getElementById('dialerDisplay').innerText = '--';
    }

    function playDtmfTone(char) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch (_) {}
    }

    async function startWebRtcCall() {
      if (!currentDialerNumber) {
        alert('Digite um número para discar.');
        return;
      }
      document.getElementById('btnStartCall').classList.add('hidden');
      document.getElementById('btnEndCall').classList.remove('hidden');
      document.getElementById('callStatusBadge').innerText = 'Em Ligação';
      document.getElementById('callStatusBadge').className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400';
      document.getElementById('callRemoteParty').innerText = 'Discando: ' + currentDialerNumber;
    }

    function endWebRtcCall() {
      document.getElementById('btnStartCall').classList.remove('hidden');
      document.getElementById('btnEndCall').classList.add('hidden');
      document.getElementById('callStatusBadge').innerText = 'Encerrada';
      document.getElementById('callStatusBadge').className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400';
      clearDialer();
    }

    async function loadCallHistory() {}

    // 13. BACKUP ATÔMICO DO SQLITE
    async function triggerManualBackup() {
      const btn = document.getElementById('btnBackup');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Gravando...';
      try {
        const res = await fetch('/backup/create', { method: 'POST' });
        const json = await res.json();
        if (json.success && json.backup) {
          alert('💾 Backup do Banco de Dados Concluído!\nArquivo: ' + json.backup.filename + ' (' + json.backup.sizeFormatted + ')\nSalvo com segurança em: storage/backups/');
        } else {
          alert('Erro ao gerar backup.');
        }
      } catch (e) {
        alert('Erro ao comunicar com o servidor de backup.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="database" class="w-4 h-4 text-sky-400"></i> Backup DB';
        lucide.createIcons();
      }
    }

    // 14. NOTIFICAÇÕES WINDOWS NATIVAS
    function requestDesktopNotifications() {
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
    function sendWindowsDesktopNotification(title, body) {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body, icon: '/icon.svg', badge: '/icon.svg' });
        } catch (_) {}
      }
    }

    // 15. SCANNER DE CÓDIGO DE BARRAS WEBCAM
    let html5QrcodeScanner = null;
    function openScannerModal() {
      document.getElementById('scannerModal').classList.remove('hidden');
      setTimeout(() => {
        if (!html5QrcodeScanner) {
          html5QrcodeScanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 160 } });
          html5QrcodeScanner.render((decodedText) => {
            playDtmfTone('1');
            document.getElementById('scannedCodeText').innerText = decodedText;
            sendWindowsDesktopNotification('📦 Pacote Identificado', 'Código lido via câmera: ' + decodedText);
          }, () => {});
        }
      }, 200);
    }
    function closeScannerModal() {
      document.getElementById('scannerModal').classList.add('hidden');
    }

    // 16. VIDEOCONFERÊNCIA JITSI
    function openMeetingModal() {
      document.getElementById('jitsiMeetingIframe').src = 'https://meet.jit.si/' + currentMeetingRoom;
      document.getElementById('meetingModal').classList.remove('hidden');
    }
    function closeMeetingModal() {
      document.getElementById('jitsiMeetingIframe').src = '';
      document.getElementById('meetingModal').classList.add('hidden');
    }

    // 17. SINC COMPLETA
    async function syncAllContactsAndHistory() {
      const btn = document.getElementById('railBtnSync');
      btn.classList.add('animate-spin');
      try {
        const res = await fetch('/sync/all/' + SESSION_ID, { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          alert(\`✅ Sincronização Concluída!\n\${json.data.groupsCount} Grupos\n\${json.data.contactsCount} Contatos salvos na agenda\n\${json.data.chatsCount} Conversas\`);
          loadChats();
          loadContactsList();
        }
      } catch (_) {
        alert('Erro ao sincronizar.');
      } finally {
        btn.classList.remove('animate-spin');
      }
    }

    function toggleGlobalAI() {
      alert('IA Autônoma está ativa e operando exclusivamente para contatos classificados como Loggi.');
    }

    // AUXILIARES
    function escapeHtml(text) {
      if (!text) return '';
      return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function formatTimestamp(ts) {
      if (!ts) return '';
      const d = new Date(ts * 1000);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // INICIALIZAÇÃO
    startRealtimeClock();
    fetchLiveWeather();
    setInterval(fetchLiveWeather, 60000); // Clima a cada 1 min
    loadChats();
    loadContactsList();
    requestDesktopNotifications();
    lucide.createIcons();
  </script>
</body>
</html>\`;
}
`;

fs.writeFileSync(targetPath, code, 'utf8');
console.log('✅ dashboardRoutes.ts gerado com sucesso! Tamanho:', code.length);
