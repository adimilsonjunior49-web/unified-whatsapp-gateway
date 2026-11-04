import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { eventBus } from '../../infrastructure/queue/eventBus';
import fs from 'fs';
import path from 'path';

export async function dashboardRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Manifesto PWA
  fastify.get('/manifest.json', async (_req, reply) => {
    return reply.type('application/json').send({
      name: 'Atlas Enterprise WhatsApp Cockpit',
      short_name: 'Atlas WPP',
      description: 'Painel Executivo de Gestão WhatsApp, Live Chat e Agentes IA',
      start_url: '/',
      display: 'standalone',
      background_color: '#030712',
      theme_color: '#10B981',
      icons: [
        {
          src: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png',
          sizes: '512x512',
          type: 'image/png'
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
    return reply.type('text/html').send(renderFullAppHTML());
  });

  fastify.get('/dashboard', async (_req, reply) => {
    return reply.type('text/html').send(renderFullAppHTML());
  });
}

function renderFullAppHTML(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Atlas WhatsApp Cockpit & Agency Hub</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#10B981">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3670/3670051.png">

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
      background: rgba(17, 24, 39, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-card {
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    /* Scrollbar personalizada */
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
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <i data-lucide="shield-check" class="w-5 h-5 text-white"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="font-extrabold text-base sm:text-lg text-white tracking-tight">Atlas WhatsApp Cockpit</h1>
            <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> CONECTADO
            </span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">+55 11 97625-8311 & The Agency AI Hub</p>
        </div>
      </div>

      <!-- Quick Actions Header -->
      <div class="flex items-center space-x-3">
        <div class="hidden sm:flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <i data-lucide="cpu" class="w-3.5 h-3.5 text-purple-400"></i>
          <span id="headerRamText" class="font-mono text-slate-300">RAM: -- MB</span>
        </div>

        <button onclick="toggleGlobalAI()" id="btnGlobalAI" class="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-bold bg-brand-500/10 text-brand-400 border-brand-500/30">
          <i data-lucide="bot" class="w-3.5 h-3.5"></i>
          <span id="globalAiLabel">IA: Ativa</span>
        </button>

        <a href="/documentation" target="_blank" class="hidden md:flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition">
          <i data-lucide="file-code" class="w-3.5 h-3.5"></i>
          <span>Swagger API</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Executive App Body -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex-1 w-full space-y-5">

    <!-- Top Navigation Tabs -->
    <div class="border-b border-slate-800 flex space-x-2 sm:space-x-6 overflow-x-auto text-xs sm:text-sm font-semibold">
      <button onclick="navigateTab('live-chat')" id="nav-live-chat" class="nav-tab pb-3 px-2 border-b-2 border-brand-500 text-brand-400 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="messages-square" class="w-4 h-4"></i>
        <span>Live Chat (Inbox)</span>
      </button>
      <button onclick="navigateTab('agency-agents')" id="nav-agency-agents" class="nav-tab pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="bot" class="w-4 h-4"></i>
        <span>Agentes de IA (The Agency)</span>
      </button>
      <button onclick="navigateTab('broadcast')" id="nav-broadcast" class="nav-tab pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="send" class="w-4 h-4"></i>
        <span>Disparos & Campanhas</span>
      </button>
      <button onclick="navigateTab('transcriptions')" id="nav-transcriptions" class="nav-tab pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="mic" class="w-4 h-4"></i>
        <span>Transcrições Whisper</span>
      </button>
      <button onclick="navigateTab('telemetry')" id="nav-telemetry" class="nav-tab pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2 whitespace-nowrap">
        <i data-lucide="activity" class="w-4 h-4"></i>
        <span>Telemetria & PWA</span>
      </button>
    </div>

    <!-- TAB 1: LIVE CHAT (INBOX MULTI-ATENDIMENTO ESTILO WHATSAPP WEB) -->
    <div id="view-live-chat" class="tab-pane">
      <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800 grid grid-cols-1 md:grid-cols-12 h-[680px]">
        
        <!-- Left Column: Conversations List -->
        <div class="md:col-span-4 border-r border-slate-800 flex flex-col bg-exec-900/60">
          <div class="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-white text-sm flex items-center gap-2">
              <i data-lucide="message-circle" class="w-4 h-4 text-brand-400"></i>
              Conversas Recentes
            </h3>
            <button onclick="loadChats()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition" title="Atualizar">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Chat List -->
          <div id="chatListContainer" class="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            <div class="p-6 text-center text-xs text-slate-500">
              Carregando conversas do WhatsApp...
            </div>
          </div>
        </div>

        <!-- Right Column: Active Conversation Screen -->
        <div class="md:col-span-8 flex flex-col bg-exec-950/80">
          <!-- Active Chat Header -->
          <div id="activeChatHeader" class="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-brand-400 font-bold text-sm">
                <i data-lucide="user" class="w-4 h-4"></i>
              </div>
              <div>
                <h4 id="activeContactName" class="font-bold text-white text-sm">Selecione uma conversa</h4>
                <p id="activeContactJid" class="text-[11px] text-slate-400 font-mono">Nenhum contato aberto</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span id="activePersonaBadge" class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <i data-lucide="bot" class="w-3 h-3"></i> IA Ativa
              </span>
            </div>
          </div>

          <!-- Message Bubbles Container -->
          <div id="messageHistoryContainer" class="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col justify-end">
            <div class="m-auto text-center text-slate-500 text-xs space-y-2">
              <i data-lucide="messages-square" class="w-10 h-10 mx-auto text-slate-700"></i>
              <p>Escolha uma conversa na lista ao lado ou envie uma nova mensagem.</p>
            </div>
          </div>

          <!-- Message Input Box -->
          <div class="p-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center space-x-2">
            <input type="text" id="liveMsgInput" placeholder="Digite uma mensagem para o cliente..." class="flex-1 bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500">
            
            <button onclick="sendLiveMessage()" class="px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20">
              <i data-lucide="send" class="w-4 h-4"></i>
              <span class="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- TAB 2: AGENTES DE IA (THE AGENCY HUB) -->
    <div id="view-agency-agents" class="tab-pane hidden space-y-5">
      <div class="glass-panel rounded-2xl p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h3 class="font-extrabold text-white text-lg flex items-center gap-2">
              <i data-lucide="bot" class="w-5 h-5 text-brand-400"></i>
              Central de Agentes de IA (The Agency)
            </h3>
            <p class="text-xs text-slate-400 mt-1">Personas autônomas especializadas conectadas ao FreeLLMAPI e Ollama locais a custo zero.</p>
          </div>

          <div class="flex items-center space-x-3">
            <span class="text-xs text-slate-400">Motor Ativo:</span>
            <span class="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/20">
              Claude 3.5 Sonnet / Qwen 2.5
            </span>
          </div>
        </div>

        <!-- Personas Grid -->
        <div id="personasGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Rendered via JS -->
        </div>
      </div>
    </div>

    <!-- TAB 3: DISPARADOR & CAMPANHAS -->
    <div id="view-broadcast" class="tab-pane hidden space-y-5">
      <div class="glass-panel rounded-2xl p-6 max-w-3xl mx-auto space-y-5">
        <div class="border-b border-slate-800 pb-4">
          <h3 class="font-extrabold text-white text-lg flex items-center gap-2">
            <i data-lucide="send" class="w-5 h-5 text-brand-400"></i>
            Disparador de Campanhas com Anti-Ban
          </h3>
          <p class="text-xs text-slate-400 mt-1">Envio com intervalos randômicos (jitter) e simulação de digitação para prevenir bloqueios.</p>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1.5">Lista de Números de Destino (um por linha)</label>
            <textarea id="broadcastNumbers" rows="4" placeholder="5511999999999&#10;5511888888888" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-brand-500"></textarea>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1.5">Mensagem da Campanha</label>
            <textarea id="broadcastText" rows="4" placeholder="Olá! Mensagem da campanha corporativa..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"></textarea>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span class="font-bold text-white block">Intervalo Anti-Ban (Jitter)</span>
              <span class="text-slate-400">Delay aleatório entre 4 e 10 segundos entre cada envio.</span>
            </div>
            <span class="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">Ativado (5s-10s)</span>
          </div>

          <button onclick="startBroadcast()" id="btnBroadcast" class="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2">
            <i data-lucide="play" class="w-4 h-4"></i>
            <span>Iniciar Disparo da Campanha</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 4: TRANSCRIÇÕES WHISPER -->
    <div id="view-transcriptions" class="tab-pane hidden space-y-4">
      <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 class="font-extrabold text-white text-lg flex items-center gap-2">
              <i data-lucide="file-audio" class="w-5 h-5 text-brand-400"></i>
              Central de Transcrição Whisper
            </h3>
            <p class="text-xs text-slate-400">Todas as mensagens de voz recebidas transcritas na íntegra palavra por palavra.</p>
          </div>
          <button onclick="loadEvents()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl transition flex items-center gap-1.5">
            <i data-lucide="refresh-cw" class="w-3 h-3"></i> Atualizar Feed
          </button>
        </div>

        <div id="transcriptionsList" class="space-y-3">
          <div class="p-8 text-center text-slate-500 text-xs">
            Nenhum áudio recebido até o momento. Envie uma mensagem de voz para ver o player e a transcrição literal aqui.
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: TELEMETRIA & PWA -->
    <div id="view-telemetry" class="tab-pane hidden space-y-5">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="glass-card rounded-2xl p-5">
          <p class="text-[11px] text-slate-400 uppercase font-bold">Instância Conectada</p>
          <h4 class="text-xl font-bold text-white mt-1">whatsapp_principal</h4>
          <span class="text-xs text-emerald-400 font-mono mt-0.5 block">+55 11 97625-8311</span>
        </div>
        <div class="glass-card rounded-2xl p-5">
          <p class="text-[11px] text-slate-400 uppercase font-bold">Consumo de Memória</p>
          <h4 id="telemetryRam" class="text-xl font-bold text-white mt-1">-- MB</h4>
          <span class="text-xs text-slate-400 mt-0.5 block">Ultra-eficiente</span>
        </div>
        <div class="glass-card rounded-2xl p-5">
          <p class="text-[11px] text-slate-400 uppercase font-bold">Uptime Gateway</p>
          <h4 id="telemetryUptime" class="text-xl font-bold text-white mt-1">--</h4>
          <span class="text-xs text-emerald-400 mt-0.5 block">Online estável</span>
        </div>
        <div class="glass-card rounded-2xl p-5">
          <p class="text-[11px] text-slate-400 uppercase font-bold">Motor Baileys</p>
          <h4 class="text-xl font-bold text-white mt-1">v7.0.0 (WebSockets)</h4>
          <span class="text-xs text-blue-400 mt-0.5 block">Sem navegador</span>
        </div>
      </div>

      <!-- PWA Installation Guide -->
      <div class="glass-panel rounded-2xl p-6 max-w-2xl mx-auto space-y-4 text-center">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-brand-500/20">
          <i data-lucide="smartphone" class="w-7 h-7 text-white"></i>
        </div>
        <h4 class="font-extrabold text-white text-base">Instale este Cockpit no seu Celular (App PWA)</h4>
        <p class="text-xs text-slate-300 max-w-md mx-auto">
          Abra o endereço <code class="text-brand-400">http://192.168.0.66:8080</code> no navegador do seu smartphone e toque em <strong>"Adicionar à Tela de Início"</strong> para utilizá-lo como app nativo.
        </p>
      </div>
    </div>

  </main>

  <script>
    const SESSION_ID = 'whatsapp_principal';
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

      if (tabName === 'live-chat') loadChats();
      if (tabName === 'agency-agents') loadPersonas();
      if (tabName === 'transcriptions') loadEvents();
      lucide.createIcons();
    }

    // Health & Telemetria
    async function updateHealth() {
      try {
        const res = await fetch('/health');
        if (res.ok) {
          const data = await res.json();
          const ram = (data.memory?.rssMB || 0) + ' MB';
          const up = Math.floor(data.uptimeSeconds / 60) + 'm ' + (data.uptimeSeconds % 60) + 's';
          document.getElementById('headerRamText').innerText = 'RAM: ' + ram;
          document.getElementById('telemetryRam').innerText = ram;
          document.getElementById('telemetryUptime').innerText = up;
        }
      } catch (_) {}
    }

    // Carregar Conversas
    async function loadChats() {
      try {
        const res = await fetch('/chats/' + SESSION_ID);
        const json = await res.json();
        const container = document.getElementById('chatListContainer');
        const chats = json.data || [];

        if (chats.length === 0) {
          container.innerHTML = '<div class="p-6 text-center text-xs text-slate-500">Nenhuma conversa recebida ainda.</div>';
          return;
        }

        container.innerHTML = chats.map(c => {
          const isSelected = c.remoteJid === activeChatJid;
          const bg = isSelected ? 'bg-slate-800/80 border-l-4 border-brand-500' : 'hover:bg-slate-800/40';
          const time = new Date(c.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return \`
            <div onclick="selectChat('\${c.remoteJid}', '\${c.name}')" class="p-3.5 cursor-pointer transition flex items-center space-x-3 \${bg}">
              <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
                \${c.name.substring(0, 2).toUpperCase()}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-white truncate">\${c.name}</h4>
                  <span class="text-[10px] text-slate-500 font-mono">\${time}</span>
                </div>
                <p class="text-[11px] text-slate-400 truncate mt-0.5">\${c.lastMessage || 'Conversa iniciada'}</p>
              </div>
            </div>
          \`;
        }).join('');
        lucide.createIcons();
      } catch (_) {}
    }

    // Selecionar conversa
    async function selectChat(jid, name) {
      activeChatJid = jid;
      document.getElementById('activeContactName').innerText = name || jid.split('@')[0];
      document.getElementById('activeContactJid').innerText = jid;
      loadChatMessages(jid);
      loadChats();
    }

    // Carregar mensagens do chat
    async function loadChatMessages(jid) {
      if (!jid) return;
      try {
        const res = await fetch('/chats/' + SESSION_ID + '/' + encodeURIComponent(jid) + '/messages');
        const json = await res.json();
        const container = document.getElementById('messageHistoryContainer');
        const messages = json.data || [];

        if (messages.length === 0) {
          container.innerHTML = '<div class="m-auto text-center text-xs text-slate-500">Nenhuma mensagem no histórico.</div>';
          return;
        }

        container.innerHTML = messages.map(m => {
          const isMe = m.isFromMe;
          const align = isMe ? 'items-end' : 'items-start';
          const bubble = isMe ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60';
          const time = new Date(m.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return \`
            <div class="flex flex-col \${align} max-w-[80%] \${isMe ? 'self-end' : 'self-start'}">
              <div class="px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed \${bubble}">
                <p class="whitespace-pre-wrap">\${m.text}</p>
                <span class="text-[9px] opacity-70 block text-right mt-1 font-mono">\${time}</span>
              </div>
            </div>
          \`;
        }).join('');
        container.scrollTop = container.scrollHeight;
      } catch (_) {}
    }

    // Enviar mensagem no chat ao vivo
    async function sendLiveMessage() {
      const input = document.getElementById('liveMsgInput');
      const text = input.value.trim();
      if (!activeChatJid) {
        alert('Selecione uma conversa primeiro.');
        return;
      }
      if (!text) return;

      input.value = '';
      try {
        await fetch('/messages/' + SESSION_ID + '/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sua_chave_mestra_secreta_aqui'
          },
          body: JSON.stringify({
            to: activeChatJid,
            text: text
          })
        });
        loadChatMessages(activeChatJid);
        loadChats();
      } catch (_) {}
    }

    // Carregar Personas do AgencyHub
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
            ? '<span class="px-3 py-1.5 rounded-xl bg-brand-500 text-white font-bold text-xs flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5"></i> Persona Ativa</span>'
            : \`<button onclick="setActivePersona('\${p.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition">Ativar no WhatsApp</button>\`;

          return \`
            <div class="glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 \${border}">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="w-10 h-10 rounded-xl bg-slate-800 text-brand-400 flex items-center justify-center font-bold">
                    <i data-lucide="\${p.icon}" class="w-5 h-5"></i>
                  </div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">\${p.division}</span>
                </div>
                <div>
                  <h4 class="font-bold text-white text-base">\${p.name}</h4>
                  <p class="text-xs text-brand-400 font-medium mt-0.5">\${p.role}</p>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">\${p.description}</p>
              </div>
              <div class="pt-3 border-t border-slate-800/80 flex justify-end">
                \${btn}
              </div>
            </div>
          \`;
        }).join('');
        lucide.createIcons();
      } catch (_) {}
    }

    // Ativar Persona
    async function setActivePersona(personaId) {
      await fetch('/agents/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId })
      });
      loadPersonas();
    }

    // Alternar IA Global
    async function toggleGlobalAI() {
      isAIGlobal = !isAIGlobal;
      await fetch('/agents/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: isAIGlobal })
      });
      document.getElementById('globalAiLabel').innerText = isAIGlobal ? 'IA: Ativa' : 'IA: Pausada';
      document.getElementById('btnGlobalAI').className = isAIGlobal
        ? 'flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-bold bg-brand-500/10 text-brand-400 border-brand-500/30'
        : 'flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-bold bg-slate-800 text-slate-400 border-slate-700';
    }

    // Disparo em Massa Anti-Ban
    async function startBroadcast() {
      const numbersText = document.getElementById('broadcastNumbers').value.trim();
      const text = document.getElementById('broadcastText').value.trim();
      const btn = document.getElementById('btnBroadcast');

      if (!numbersText || !text) {
        alert('Informe a lista de números e o texto da mensagem.');
        return;
      }

      const numbers = numbersText.split(/\\r?\\n/).map(n => n.trim().replace(/\\D/g, '')).filter(Boolean);
      if (numbers.length === 0) return;

      btn.disabled = true;
      btn.innerText = 'Disparando (0 / ' + numbers.length + ')...';

      for (let i = 0; i < numbers.length; i++) {
        const num = numbers[i];
        btn.innerText = 'Enviando (' + (i + 1) + ' / ' + numbers.length + ') para ' + num + '...';
        try {
          await fetch('/messages/' + SESSION_ID + '/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer sua_chave_mestra_secreta_aqui'
            },
            body: JSON.stringify({ to: num, text: text })
          });
        } catch (_) {}
        // Jitter randômico de 4 a 8 segundos
        const delay = Math.floor(Math.random() * 4000) + 4000;
        await new Promise(r => setTimeout(r, delay));
      }

      btn.disabled = false;
      btn.innerText = 'Campanha Concluída com Sucesso!';
      setTimeout(() => { btn.innerText = 'Iniciar Disparo da Campanha'; }, 3000);
    }

    // Carregar eventos e transcrições
    async function loadEvents() {
      try {
        const res = await fetch('/events/recent');
        const json = await res.json();
        const container = document.getElementById('transcriptionsList');
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

    // Polling contínuo a cada 3.5 segundos
    setInterval(() => {
      updateHealth();
      if (activeChatJid) loadChatMessages(activeChatJid);
      loadChats();
    }, 3500);

    // Inicialização
    updateHealth();
    loadChats();
    loadPersonas();
    lucide.createIcons();
  </script>
</body>
</html>`;
}
