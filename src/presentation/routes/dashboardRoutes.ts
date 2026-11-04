import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { eventBus } from '../../infrastructure/queue/eventBus';
import { sessionService } from '../../application/sessionService';

export async function dashboardRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Manifesto PWA
  fastify.get('/manifest.json', async (_req, reply) => {
    return reply.type('application/json').send({
      name: 'Unified WhatsApp Gateway Hub',
      short_name: 'WPP Gateway',
      description: 'Painel Corporativo de Conexões WhatsApp, Bots e Transcrição com IA',
      start_url: '/',
      display: 'standalone',
      background_color: '#0B0F19',
      theme_color: '#25D366',
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

  // Eventos recentes para polling do Dashboard
  fastify.get('/events/recent', async (_req, reply) => {
    const events = eventBus.getRecentEvents();
    return reply.send({
      success: true,
      count: events.length,
      data: events
    });
  });

  // Rota principal do Dashboard Web SPA
  fastify.get('/', async (_req, reply) => {
    return reply.type('text/html').send(renderDashboardHTML());
  });

  fastify.get('/dashboard', async (_req, reply) => {
    return reply.type('text/html').send(renderDashboardHTML());
  });
}

function renderDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Unified WhatsApp Hub | Painel Corporativo</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#25D366">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="WPP Gateway">
  <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3670/3670051.png">

  <!-- Tailwind CSS & Lucide Icons via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#eefdf3',
              500: '#25D366',
              600: '#1da851',
              700: '#128C7E',
              900: '#075E54'
            },
            dark: {
              bg: '#0B0F19',
              card: '#111827',
              border: '#1F2937',
              input: '#1A2234'
            }
          }
        }
      }
    }
  </script>
  <style>
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.02); }
    }
    .animate-pulse-slow {
      animation: pulse-slow 3s infinite ease-in-out;
    }
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0B0F19; }
    ::-webkit-scrollbar-thumb { background: #25D36655; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #25D36688; }
  </style>
</head>
<body class="bg-dark-bg text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-brand-500 selection:text-white">

  <!-- Top Navigation Bar -->
  <header class="border-b border-dark-border bg-dark-card/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <i data-lucide="message-square" class="w-5 h-5 text-white"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="font-bold text-lg text-white tracking-tight">Unified WhatsApp Hub</h1>
            <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> v1.0.0
            </span>
          </div>
          <p class="text-xs text-slate-400">Gateway Corporativo Multi-Sessão & IA</p>
        </div>
      </div>

      <!-- Right Controls -->
      <div class="flex items-center space-x-3">
        <!-- Server Status Badge -->
        <div id="serverStatusBadge" class="hidden sm:flex items-center space-x-2 text-xs bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span id="serverStatusText" class="text-slate-300 font-medium">Verificando...</span>
        </div>

        <!-- API Key Config Modal Trigger -->
        <button onclick="openApiKeyModal()" class="flex items-center space-x-1.5 text-xs bg-dark-border hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/60 transition" title="Configurar Chave de Acesso">
          <i data-lucide="key" class="w-3.5 h-3.5 text-amber-400"></i>
          <span class="hidden md:inline">API Key</span>
        </button>

        <!-- Swagger Link -->
        <a href="/documentation" target="_blank" class="flex items-center space-x-1.5 text-xs bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 px-3 py-1.5 rounded-lg border border-brand-500/30 transition">
          <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
          <span class="hidden md:inline">Swagger Docs</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col space-y-6">

    <!-- KPI Summary Row -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center space-x-4 shadow-sm">
        <div class="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
          <i data-lucide="radio" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-xs text-slate-400 uppercase tracking-wider font-medium">Sessões Ativas</p>
          <h3 id="statConnected" class="text-2xl font-bold text-white">0</h3>
        </div>
      </div>

      <div class="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center space-x-4 shadow-sm">
        <div class="p-3 rounded-lg bg-blue-500/10 text-blue-400">
          <i data-lucide="layers" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-xs text-slate-400 uppercase tracking-wider font-medium">Instâncias Totais</p>
          <h3 id="statTotal" class="text-2xl font-bold text-white">0</h3>
        </div>
      </div>

      <div class="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center space-x-4 shadow-sm">
        <div class="p-3 rounded-lg bg-purple-500/10 text-purple-400">
          <i data-lucide="cpu" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-xs text-slate-400 uppercase tracking-wider font-medium">Consumo de RAM</p>
          <h3 id="statRam" class="text-2xl font-bold text-white">-- MB</h3>
        </div>
      </div>

      <div class="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center space-x-4 shadow-sm">
        <div class="p-3 rounded-lg bg-amber-500/10 text-amber-400">
          <i data-lucide="clock" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-xs text-slate-400 uppercase tracking-wider font-medium">Uptime Gateway</p>
          <h3 id="statUptime" class="text-2xl font-bold text-white">--</h3>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <div class="border-b border-dark-border flex space-x-2 sm:space-x-6 overflow-x-auto text-sm font-medium">
      <button onclick="switchTab('sessions')" id="tab-btn-sessions" class="tab-btn pb-3 px-2 border-b-2 border-brand-500 text-brand-500 flex items-center space-x-2">
        <i data-lucide="smartphone" class="w-4 h-4"></i>
        <span>Gerenciador de Sessões</span>
      </button>
      <button onclick="switchTab('messages')" id="tab-btn-messages" class="tab-btn pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2">
        <i data-lucide="send" class="w-4 h-4"></i>
        <span>Disparador & Testes</span>
      </button>
      <button onclick="switchTab('live-feed')" id="tab-btn-live-feed" class="tab-btn pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2">
        <i data-lucide="activity" class="w-4 h-4"></i>
        <span>Feed ao Vivo & Áudios</span>
      </button>
      <button onclick="switchTab('integrations')" id="tab-btn-integrations" class="tab-btn pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2">
        <i data-lucide="plug" class="w-4 h-4"></i>
        <span>Integrações (Typebot/Chatwoot)</span>
      </button>
      <button onclick="switchTab('mobile-app')" id="tab-btn-mobile-app" class="tab-btn pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2">
        <i data-lucide="download" class="w-4 h-4"></i>
        <span>Instalar no Celular (PWA)</span>
      </button>
    </div>

    <!-- TAB 1: GERENCIADOR DE SESSÕES -->
    <div id="tab-content-sessions" class="tab-content space-y-6">
      <!-- Create Session Bar -->
      <div class="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="font-semibold text-white text-base">Conectar Novo Número WhatsApp</h3>
          <p class="text-xs text-slate-400">Inicie uma sessão isolada para gerar o QR Code oficial do WhatsApp Web.</p>
        </div>
        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <input type="text" id="newSessionInput" placeholder="Ex: atendimento-01" class="bg-dark-input border border-dark-border text-white text-sm rounded-lg px-3 py-2 w-full sm:w-48 focus:outline-none focus:border-brand-500">
          <button onclick="createNewSession()" class="bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center space-x-2 transition whitespace-nowrap shadow-lg shadow-brand-500/20">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Iniciar Sessão</span>
          </button>
        </div>
      </div>

      <!-- Sessions Grid -->
      <div id="sessionsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div class="col-span-full py-12 text-center text-slate-500">
          <i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-2 text-slate-400"></i>
          Carregando sessões registradas...
        </div>
      </div>
    </div>

    <!-- TAB 2: DISPARADOR & TESTES DE MENSAGENS -->
    <div id="tab-content-messages" class="tab-content hidden space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form Column -->
        <div class="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6 space-y-5">
          <div class="flex items-center justify-between border-b border-dark-border pb-4">
            <div>
              <h3 class="font-semibold text-white text-base flex items-center gap-2">
                <i data-lucide="send" class="w-5 h-5 text-brand-500"></i>
                Envio Direto de Mensagens & Mídias
              </h3>
              <p class="text-xs text-slate-400">Envie mensagens de texto formatadas, áudios PTT nativos e imagens.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Select Session -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">Sessão Remetente</label>
              <select id="msgSessionSelect" class="bg-dark-input border border-dark-border text-white text-sm rounded-lg px-3 py-2.5 w-full focus:outline-none focus:border-brand-500">
                <option value="">Selecione uma sessão...</option>
              </select>
            </div>

            <!-- Destination Phone -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">Número de Destino (com DDD)</label>
              <input type="text" id="msgToInput" placeholder="Ex: 5511999999999" class="bg-dark-input border border-dark-border text-white text-sm rounded-lg px-3 py-2.5 w-full focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <!-- Message Type Selector -->
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Tipo de Mensagem</label>
            <div class="grid grid-cols-3 gap-3">
              <button type="button" onclick="setMessageType('text')" id="btnType-text" class="msg-type-btn py-2 px-3 rounded-lg border border-brand-500 bg-brand-500/10 text-brand-400 text-xs font-medium flex items-center justify-center gap-2">
                <i data-lucide="align-left" class="w-4 h-4"></i> Texto
              </button>
              <button type="button" onclick="setMessageType('audio')" id="btnType-audio" class="msg-type-btn py-2 px-3 rounded-lg border border-dark-border bg-dark-input text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
                <i data-lucide="mic" class="w-4 h-4"></i> Áudio de Voz (PTT)
              </button>
              <button type="button" onclick="setMessageType('image')" id="btnType-image" class="msg-type-btn py-2 px-3 rounded-lg border border-dark-border bg-dark-input text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
                <i data-lucide="image" class="w-4 h-4"></i> Imagem com Legenda
              </button>
            </div>
          </div>

          <!-- Dynamic Field: Text -->
          <div id="field-text" class="space-y-1.5">
            <label class="block text-xs font-medium text-slate-300">Conteúdo do Texto</label>
            <textarea id="msgTextInput" rows="4" placeholder="Escreva a mensagem aqui..." class="bg-dark-input border border-dark-border text-white text-sm rounded-lg p-3 w-full focus:outline-none focus:border-brand-500"></textarea>
          </div>

          <!-- Dynamic Field: Media URL -->
          <div id="field-media" class="hidden space-y-1.5">
            <label class="block text-xs font-medium text-slate-300">URL Pública da Mídia (Áudio MP3/OGG ou Imagem JPG/PNG)</label>
            <input type="url" id="msgMediaUrlInput" placeholder="https://exemplo.com/arquivo.mp3" class="bg-dark-input border border-dark-border text-white text-sm rounded-lg px-3 py-2.5 w-full focus:outline-none focus:border-brand-500">
            <p id="audioTranscodeNotice" class="text-[11px] text-emerald-400 flex items-center gap-1">
              <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
              Transcodificação automática FFmpeg Opus 16kHz ativada para reprodução de áudio nativa no WhatsApp.
            </p>
          </div>

          <button onclick="sendDirectMessage()" id="btnSendMessage" class="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm py-3 rounded-lg flex items-center justify-center space-x-2 transition shadow-lg shadow-brand-500/20">
            <i data-lucide="send" class="w-4 h-4"></i>
            <span>Disparar Mensagem Agora</span>
          </button>
        </div>

        <!-- Result Console Column -->
        <div class="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h4 class="font-semibold text-white text-sm mb-2 flex items-center gap-2">
              <i data-lucide="terminal" class="w-4 h-4 text-slate-400"></i>
              Console de Resposta da API
            </h4>
            <div id="msgResponseConsole" class="bg-dark-bg border border-dark-border rounded-lg p-3 text-xs font-mono text-slate-400 h-64 overflow-y-auto">
              Aguardando envio de mensagem...
            </div>
          </div>
          <div class="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400">
            <p class="font-semibold text-slate-300 mb-1">Dica de Produção:</p>
            Todas as mensagens enviadas acionam automaticamente o barramento assíncrono de eventos, replicando para webhooks e audit trails.
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: FEED AO VIVO & TRANSCRIÇÕES -->
    <div id="tab-content-live-feed" class="tab-content hidden space-y-4">
      <div class="flex items-center justify-between bg-dark-card border border-dark-border rounded-xl p-4">
        <div class="flex items-center space-x-3">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <div>
            <h3 class="font-semibold text-white text-sm">Feed de Eventos e Mensagens em Tempo Real</h3>
            <p class="text-xs text-slate-400">Captura em tempo real de mensagens recebidas, áudios com Whisper e webhooks.</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="fetchRecentEvents()" class="bg-dark-input hover:bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-dark-border flex items-center gap-1.5 transition">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Atualizar Agora
          </button>
        </div>
      </div>

      <div id="liveEventsList" class="space-y-3">
        <div class="bg-dark-card border border-dark-border rounded-xl p-8 text-center text-slate-500">
          Nenhum evento registrado ainda. As mensagens recebidas aparecerão aqui automaticamente.
        </div>
      </div>
    </div>

    <!-- TAB 4: INTEGRAÇÕES -->
    <div id="tab-content-integrations" class="tab-content hidden space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Typebot Card -->
        <div class="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4">
          <div class="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">
            TB
          </div>
          <div>
            <h4 class="font-semibold text-white text-base">Typebot Connector</h4>
            <p class="text-xs text-slate-400 mt-1">Conecte seus fluxos visuais do Typebot para atendimento automático e captação de leads.</p>
          </div>
          <div class="text-xs text-slate-300 bg-dark-input p-2.5 rounded-lg border border-dark-border">
            Status: <span class="text-emerald-400 font-semibold">Ativo via WebhookDispatcher</span>
          </div>
        </div>

        <!-- Chatwoot Card -->
        <div class="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4">
          <div class="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
            CW
          </div>
          <div>
            <h4 class="font-semibold text-white text-base">Chatwoot Live Chat</h4>
            <p class="text-xs text-slate-400 mt-1">Centralize múltiplos atendentes humanos em uma única caixa de entrada colaborativa.</p>
          </div>
          <div class="text-xs text-slate-300 bg-dark-input p-2.5 rounded-lg border border-dark-border">
            Status: <span class="text-emerald-400 font-semibold">Pronto para Conexão</span>
          </div>
        </div>

        <!-- AI Engine Card -->
        <div class="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4">
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
            IA
          </div>
          <div>
            <h4 class="font-semibold text-white text-base">Agente IA & Whisper</h4>
            <p class="text-xs text-slate-400 mt-1">Transcrição de áudios e respostas cognitivas inteligentes com LLMs locais ou Cloud.</p>
          </div>
          <div class="text-xs text-slate-300 bg-dark-input p-2.5 rounded-lg border border-dark-border">
            Status: <span class="text-emerald-400 font-semibold">Integrado (Whisper + Opus)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: PWA / APP MOBILE -->
    <div id="tab-content-mobile-app" class="tab-content hidden space-y-6">
      <div class="bg-dark-card border border-dark-border rounded-xl p-8 max-w-2xl mx-auto text-center space-y-6">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/20">
          <i data-lucide="smartphone" class="w-8 h-8 text-white"></i>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">Instale o App no seu Celular</h3>
          <p class="text-sm text-slate-400 mt-2">
            Este painel é um Progressive Web App (PWA). Você pode instalá-lo diretamente na tela inicial do seu iPhone ou celular Android para ter a experiência de um aplicativo nativo.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div class="p-4 rounded-xl bg-dark-input border border-dark-border">
            <h4 class="font-semibold text-white text-sm flex items-center gap-2 mb-2">
              <i data-lucide="apple" class="w-4 h-4 text-slate-300"></i> No iPhone / iPad (iOS)
            </h4>
            <ol class="text-xs text-slate-400 space-y-1 list-decimal list-inside">
              <li>Abra esta página no Safari.</li>
              <li>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com seta para cima).</li>
              <li>Role e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
            </ol>
          </div>

          <div class="p-4 rounded-xl bg-dark-input border border-dark-border">
            <h4 class="font-semibold text-white text-sm flex items-center gap-2 mb-2">
              <i data-lucide="play" class="w-4 h-4 text-emerald-400"></i> No Android (Chrome)
            </h4>
            <ol class="text-xs text-slate-400 space-y-1 list-decimal list-inside">
              <li>Abra esta página no Google Chrome.</li>
              <li>Toque nos <strong>3 pontinhos</strong> no canto superior direito.</li>
              <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
            </ol>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          Pronto! O aplicativo abrirá em tela cheia com acesso rápido a todas as instâncias e mensagens.
        </div>
      </div>
    </div>

  </main>

  <!-- Modal QR Code -->
  <div id="qrModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-dark-card border border-dark-border rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-dark-border pb-3">
        <h3 class="font-bold text-white text-base flex items-center gap-2">
          <i data-lucide="qr-code" class="w-5 h-5 text-brand-500"></i>
          Escanear QR Code
        </h3>
        <button onclick="closeQrModal()" class="text-slate-400 hover:text-white">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-4 bg-white rounded-xl inline-block shadow-inner mx-auto">
        <img id="qrModalImg" src="" alt="QR Code WhatsApp" class="w-60 h-60 object-contain">
      </div>

      <p class="text-xs text-slate-400">
        Abra o WhatsApp no celular > Menu > <strong>Aparelhos conectados</strong> > <strong>Conectar um aparelho</strong> e aponte a câmera.
      </p>

      <div class="flex space-x-2">
        <button onclick="reloadSessionQr()" class="w-full bg-dark-input hover:bg-slate-700 text-white text-xs font-medium py-2 rounded-lg border border-dark-border flex items-center justify-center gap-1.5 transition">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Atualizar QR Code
        </button>
        <button onclick="closeQrModal()" class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium py-2 rounded-lg transition">
          Fechar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal API Key -->
  <div id="apiKeyModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-dark-border pb-3">
        <h3 class="font-bold text-white text-base flex items-center gap-2">
          <i data-lucide="key" class="w-5 h-5 text-amber-400"></i>
          Configuração de Acesso (API Key)
        </h3>
        <button onclick="closeApiKeyModal()" class="text-slate-400 hover:text-white">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <p class="text-xs text-slate-400">
        Insira a chave de segurança configurada no arquivo <code class="text-emerald-400">.env</code> do gateway.
      </p>

      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1.5">Secret Key</label>
        <input type="text" id="apiKeyInput" class="bg-dark-input border border-dark-border text-white text-sm rounded-lg p-2.5 w-full focus:outline-none focus:border-brand-500 font-mono">
      </div>

      <div class="flex justify-end space-x-2 pt-2">
        <button onclick="closeApiKeyModal()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-4 py-2 rounded-lg transition">
          Cancelar
        </button>
        <button onclick="saveApiKey()" class="bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition">
          Salvar Chave
        </button>
      </div>
    </div>
  </div>

  <!-- Client JavaScript Logic -->
  <script>
    let activeSessionForQr = '';
    let currentMessageType = 'text';

    function getApiKey() {
      return localStorage.getItem('GATEWAY_API_KEY') || 'dev-secret-key-change-me';
    }

    function setHeaders() {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getApiKey()
      };
    }

    // Switch Tabs
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-brand-500', 'text-brand-500');
        btn.classList.add('border-transparent', 'text-slate-400');
      });
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

      const activeBtn = document.getElementById('tab-btn-' + tabId);
      if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-slate-400');
        activeBtn.classList.add('border-brand-500', 'text-brand-500');
      }

      const activeContent = document.getElementById('tab-content-' + tabId);
      if (activeContent) {
        activeContent.classList.remove('hidden');
      }

      if (tabId === 'live-feed') {
        fetchRecentEvents();
      }
      lucide.createIcons();
    }

    // Message Type selector
    function setMessageType(type) {
      currentMessageType = type;
      document.querySelectorAll('.msg-type-btn').forEach(btn => {
        btn.classList.remove('border-brand-500', 'bg-brand-500/10', 'text-brand-400');
        btn.classList.add('border-dark-border', 'bg-dark-input', 'text-slate-400');
      });

      const selBtn = document.getElementById('btnType-' + type);
      selBtn.classList.remove('border-dark-border', 'bg-dark-input', 'text-slate-400');
      selBtn.classList.add('border-brand-500', 'bg-brand-500/10', 'text-brand-400');

      if (type === 'text') {
        document.getElementById('field-text').classList.remove('hidden');
        document.getElementById('field-media').classList.add('hidden');
      } else {
        document.getElementById('field-media').classList.remove('hidden');
        if (type === 'audio') {
          document.getElementById('field-text').classList.add('hidden');
          document.getElementById('audioTranscodeNotice').classList.remove('hidden');
        } else {
          document.getElementById('field-text').classList.remove('hidden');
          document.getElementById('audioTranscodeNotice').classList.add('hidden');
        }
      }
      lucide.createIcons();
    }

    // Health Check & Stats
    async function fetchHealth() {
      try {
        const res = await fetch('/health');
        if (res.ok) {
          const data = await res.json();
          document.getElementById('statConnected').innerText = data.sessions?.connected || 0;
          document.getElementById('statTotal').innerText = data.sessions?.total || 0;
          document.getElementById('statRam').innerText = (data.memory?.rssMB || 0) + ' MB';
          document.getElementById('statUptime').innerText = Math.floor(data.uptimeSeconds / 60) + 'm ' + (data.uptimeSeconds % 60) + 's';
          document.getElementById('serverStatusText').innerText = 'Online (' + data.status + ')';
        }
      } catch (e) {
        document.getElementById('serverStatusText').innerText = 'Falha de Conexão';
      }
    }

    // Load Sessions
    async function fetchSessions() {
      try {
        const res = await fetch('/sessions', { headers: setHeaders() });
        const grid = document.getElementById('sessionsGrid');
        const select = document.getElementById('msgSessionSelect');

        if (!res.ok) {
          grid.innerHTML = '<div class="col-span-full py-8 text-center text-rose-400">Erro de autenticação na API. Verifique a chave de API no menu superior.</div>';
          return;
        }

        const json = await res.json();
        const sessions = json.data || [];

        // Atualizar seletor de sessões na aba de mensagens
        select.innerHTML = '<option value="">Selecione uma sessão...</option>';
        sessions.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.sessionId;
          opt.innerText = s.sessionId + ' (' + s.status + ')';
          select.appendChild(opt);
        });

        if (sessions.length === 0) {
          grid.innerHTML = \`
            <div class="col-span-full py-12 text-center text-slate-500 bg-dark-card border border-dark-border rounded-xl">
              <i data-lucide="smartphone" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
              <p class="text-sm font-medium text-slate-300">Nenhuma sessão criada</p>
              <p class="text-xs text-slate-500 mt-1">Crie a primeira sessão no formulário acima para conectar seu WhatsApp.</p>
            </div>
          \`;
          lucide.createIcons();
          return;
        }

        grid.innerHTML = sessions.map(s => {
          let badge = '';
          let isConnected = s.status === 'CONNECTED';
          let hasQr = s.status === 'QRCODE' && s.qrCode;

          if (isConnected) {
            badge = '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Conectado</span>';
          } else if (hasQr) {
            badge = '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Aguardando QR</span>';
          } else {
            badge = '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">' + s.status + '</span>';
          }

          return \`
            <div class="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-bold text-white text-base">\${s.sessionId}</h4>
                  <p class="text-xs text-slate-400 font-mono mt-0.5">\${s.phoneNumber || 'Sem número associado'}</p>
                </div>
                \${badge}
              </div>

              \${hasQr ? \`
                <div class="p-3 bg-white rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-95 transition" onclick="openQrModal('\${s.sessionId}', '\${s.qrCode}')">
                  <img src="\${s.qrCode}" class="w-32 h-32 object-contain" alt="QR Code">
                  <span class="text-[11px] font-semibold text-slate-800 mt-1 flex items-center gap-1">
                    <i data-lucide="maximize-2" class="w-3 h-3"></i> Clique para Ampliar
                  </span>
                </div>
              \` : ''}

              <div class="flex items-center space-x-2 pt-2 border-t border-dark-border">
                \${hasQr ? \`
                  <button onclick="openQrModal('\${s.sessionId}', '\${s.qrCode}')" class="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium py-2 rounded-lg transition flex items-center justify-center gap-1">
                    <i data-lucide="qr-code" class="w-3.5 h-3.5"></i> Ver QR Code
                  </button>
                \` : ''}

                <button onclick="deleteSession('\${s.sessionId}')" class="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium py-2 px-3 rounded-lg border border-rose-500/20 transition flex items-center gap-1" title="Excluir Sessão">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          \`;
        }).join('');

        lucide.createIcons();
      } catch (e) {
        console.error(e);
      }
    }

    // Create Session
    async function createNewSession() {
      const input = document.getElementById('newSessionInput');
      const sessionId = input.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!sessionId) {
        alert('Por favor, informe um identificador válido (ex: vendas-01).');
        return;
      }

      try {
        const res = await fetch('/sessions/' + sessionId + '/start', {
          method: 'POST',
          headers: setHeaders()
        });
        const data = await res.json();
        if (data.success) {
          input.value = '';
          fetchSessions();
          if (data.data?.qrCode) {
            openQrModal(sessionId, data.data.qrCode);
          }
        } else {
          alert('Erro ao iniciar sessão: ' + (data.error || 'Desconhecido'));
        }
      } catch (e) {
        alert('Falha na requisição ao gateway.');
      }
    }

    // Delete Session
    async function deleteSession(sessionId) {
      if (!confirm('Deseja realmente desconectar e excluir a sessão "' + sessionId + '"?')) return;
      try {
        await fetch('/sessions/' + sessionId, {
          method: 'DELETE',
          headers: setHeaders()
        });
        fetchSessions();
      } catch (e) {
        alert('Erro ao excluir sessão.');
      }
    }

    // Modal QR Code
    function openQrModal(sessionId, qrBase64) {
      activeSessionForQr = sessionId;
      document.getElementById('qrModalImg').src = qrBase64;
      document.getElementById('qrModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeQrModal() {
      document.getElementById('qrModal').classList.add('hidden');
      activeSessionForQr = '';
    }

    async function reloadSessionQr() {
      if (!activeSessionForQr) return;
      try {
        const res = await fetch('/sessions/' + activeSessionForQr + '/status', { headers: setHeaders() });
        const json = await res.json();
        if (json.data?.qrCode) {
          document.getElementById('qrModalImg').src = json.data.qrCode;
        } else if (json.data?.status === 'CONNECTED') {
          alert('Sessão conectada com sucesso!');
          closeQrModal();
          fetchSessions();
        }
      } catch (e) {
        alert('Erro ao recarregar QR code.');
      }
    }

    // Send Message
    async function sendDirectMessage() {
      const sessionId = document.getElementById('msgSessionSelect').value;
      const to = document.getElementById('msgToInput').value.trim();
      const text = document.getElementById('msgTextInput').value.trim();
      const mediaUrl = document.getElementById('msgMediaUrlInput').value.trim();
      const consoleEl = document.getElementById('msgResponseConsole');

      if (!sessionId) {
        alert('Selecione a sessão remetente.');
        return;
      }
      if (!to) {
        alert('Informe o número de destino.');
        return;
      }

      const payload = {
        to: to,
        type: currentMessageType
      };

      if (currentMessageType === 'text') {
        if (!text) { alert('Digite o texto da mensagem.'); return; }
        payload.text = text;
      } else if (currentMessageType === 'audio') {
        if (!mediaUrl) { alert('Informe a URL do arquivo de áudio.'); return; }
        payload.mediaUrl = mediaUrl;
        payload.ptt = true;
      } else if (currentMessageType === 'image') {
        if (!mediaUrl) { alert('Informe a URL da imagem.'); return; }
        payload.mediaUrl = mediaUrl;
        payload.caption = text;
      }

      consoleEl.innerText = 'Enviando requisição para /messages/' + sessionId + '/send...\\n' + JSON.stringify(payload, null, 2);

      try {
        const res = await fetch('/messages/' + sessionId + '/send', {
          method: 'POST',
          headers: setHeaders(),
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        consoleEl.innerText = 'STATUS HTTP ' + res.status + ':\\n' + JSON.stringify(json, null, 2);
        if (json.success) {
          fetchRecentEvents();
        }
      } catch (e) {
        consoleEl.innerText = 'Erro de rede: ' + e.message;
      }
    }

    // Feed ao Vivo
    async function fetchRecentEvents() {
      try {
        const res = await fetch('/events/recent');
        const json = await res.json();
        const list = document.getElementById('liveEventsList');
        const events = json.data || [];

        if (events.length === 0) {
          list.innerHTML = '<div class="bg-dark-card border border-dark-border rounded-xl p-8 text-center text-slate-500">Nenhum evento registrado ainda.</div>';
          return;
        }

        list.innerHTML = events.map(ev => {
          let time = new Date(ev.timestamp).toLocaleTimeString();
          let icon = 'message-circle';
          if (ev.event.includes('audio')) icon = 'mic';
          if (ev.event.includes('connection')) icon = 'wifi';

          return \`
            <div class="bg-dark-card border border-dark-border rounded-xl p-4 flex items-start space-x-3 hover:border-slate-700 transition">
              <div class="p-2 rounded-lg bg-slate-800 text-brand-500 mt-0.5">
                <i data-lucide="\${icon}" class="w-4 h-4"></i>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-white">\${ev.event} (\${ev.sessionId})</span>
                  <span class="text-[11px] text-slate-400 font-mono">\${time}</span>
                </div>
                <div class="mt-2 text-xs bg-dark-bg p-2.5 rounded-lg border border-dark-border font-mono text-slate-300 overflow-x-auto">
                  <pre class="whitespace-pre-wrap">\${JSON.stringify(ev.data, null, 2)}</pre>
                </div>
              </div>
            </div>
          \`;
        }).join('');

        lucide.createIcons();
      } catch (e) {
        console.error(e);
      }
    }

    // API Key Modal
    function openApiKeyModal() {
      document.getElementById('apiKeyInput').value = getApiKey();
      document.getElementById('apiKeyModal').classList.remove('hidden');
    }

    function closeApiKeyModal() {
      document.getElementById('apiKeyModal').classList.add('hidden');
    }

    function saveApiKey() {
      const key = document.getElementById('apiKeyInput').value.trim();
      if (key) {
        localStorage.setItem('GATEWAY_API_KEY', key);
        closeApiKeyModal();
        fetchSessions();
      }
    }

    // Auto-refresh loop
    setInterval(() => {
      fetchHealth();
      fetchSessions();
    }, 4000);

    // Initial load
    fetchHealth();
    fetchSessions();
    lucide.createIcons();
  </script>
</body>
</html>`;
}
