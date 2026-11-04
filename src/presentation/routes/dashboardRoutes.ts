import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { eventBus } from '../../infrastructure/queue/eventBus';
import { sessionService } from '../../application/sessionService';
import fs from 'fs';
import path from 'path';

export async function dashboardRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Manifesto PWA
  fastify.get('/manifest.json', async (_req, reply) => {
    return reply.type('application/json').send({
      name: 'Atlas Enterprise WhatsApp Cockpit',
      short_name: 'Atlas WPP',
      description: 'Painel Executivo de Gestão WhatsApp, Atendimento e Transcrição IA',
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

  // Imagem direta do QR Code principal
  fastify.get('/qrcode.png', async (_req, reply) => {
    const qrPath = path.resolve(process.cwd(), 'qrcode_whatsapp.png');
    if (fs.existsSync(qrPath)) {
      const buffer = fs.readFileSync(qrPath);
      return reply.type('image/png').send(buffer);
    }
    return reply.status(404).send({ error: 'QR Code ainda não gerado.' });
  });

  // Eventos recentes para feed ao vivo
  fastify.get('/events/recent', async (_req, reply) => {
    const events = eventBus.getRecentEvents();
    return reply.send({
      success: true,
      count: events.length,
      data: events
    });
  });

  // Rota principal do Dashboard Web SPA Executivo
  fastify.get('/', async (_req, reply) => {
    return reply.type('text/html').send(renderExecutiveDashboardHTML());
  });

  fastify.get('/dashboard', async (_req, reply) => {
    return reply.type('text/html').send(renderExecutiveDashboardHTML());
  });
}

function renderExecutiveDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Atlas WhatsApp Cockpit | Central Executiva</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#10B981">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Atlas WPP">
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
              50: '#ecfdf5',
              100: '#d1fae5',
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
      background: rgba(17, 24, 39, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .qr-glow {
      box-shadow: 0 0 40px -10px rgba(16, 185, 129, 0.35);
    }
  </style>
</head>
<body class="bg-exec-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">

  <!-- Top Executive Header -->
  <header class="glass-panel sticky top-0 z-50 border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
          <i data-lucide="shield-check" class="w-5 h-5 text-white"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="font-bold text-base sm:text-lg text-white tracking-tight">Atlas WhatsApp Cockpit</h1>
            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Enterprise Executive
            </span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">Gateway Primário Multi-Tenant & Inteligência Artificial</p>
        </div>
      </div>

      <!-- Quick Action Badges -->
      <div class="flex items-center space-x-3">
        <div id="liveHealthPill" class="flex items-center space-x-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg shadow-inner">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span id="gatewayStatusText" class="text-slate-300 font-semibold font-mono">Gateway Online</span>
        </div>

        <a href="/documentation" target="_blank" class="hidden sm:flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/80 transition font-medium">
          <i data-lucide="file-code" class="w-3.5 h-3.5 text-slate-400"></i>
          <span>OpenAPI Docs</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Executive Layout -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">

    <!-- HERO SECTION: CONEXÃO PRINCIPAL DO SEU WHATSAPP (QR CODE ATIVO) -->
    <section class="glass-panel rounded-2xl p-6 sm:p-8 border border-brand-500/30 relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <!-- Text & Status Column -->
        <div class="lg:col-span-7 space-y-4">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-brand-400 text-xs font-semibold">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Instância Master Corporativa</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Conecte seu WhatsApp Principal
          </h2>
          <p class="text-sm text-slate-300 leading-relaxed max-w-xl">
            Pareie seu celular agora via QR Code para habilitar esta central como sua <strong>aplicação prioritária</strong>. Você gerencia conversas, transcreve áudios com Whisper na íntegra, envia mensagens de voz PTT e automatiza atendimentos.
          </p>

          <!-- Step by Step -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span class="font-bold text-brand-400">Passo 1</span>
              <p class="text-slate-300">Abra o WhatsApp no celular</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span class="font-bold text-brand-400">Passo 2</span>
              <p class="text-slate-300">Toque em <strong>Aparelhos Conectados</strong></p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span class="font-bold text-brand-400">Passo 3</span>
              <p class="text-slate-300">Aponte para o QR Code ao lado</p>
            </div>
          </div>

          <!-- Master Session Controls -->
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <div id="masterStatusBadge" class="flex items-center space-x-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span id="masterStatusText">Aguardando Leitura do QR Code</span>
            </div>

            <button onclick="refreshMasterQr()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-2 transition">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Regerar QR Code</span>
            </button>
          </div>
        </div>

        <!-- QR Code Visual Card Column -->
        <div class="lg:col-span-5 flex flex-col items-center justify-center">
          <div class="p-5 bg-white rounded-2xl qr-glow inline-block shadow-2xl transition transform hover:scale-[1.01]">
            <img id="masterQrImage" src="/qrcode.png" alt="QR Code WhatsApp" class="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-lg">
          </div>
          <p class="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <i data-lucide="lock" class="w-3.5 h-3.5 text-brand-400"></i>
            Conexão criptografada ponta a ponta via WebSockets direto
          </p>
        </div>
      </div>
    </section>

    <!-- Top Executive KPIs -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="glass-card rounded-xl p-4 flex items-center space-x-4">
        <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
          <i data-lucide="check-circle-2" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Status Master</p>
          <h4 id="kpiMasterStatus" class="text-lg font-bold text-white">SCAN_QR</h4>
        </div>
      </div>

      <div class="glass-card rounded-xl p-4 flex items-center space-x-4">
        <div class="p-3 rounded-xl bg-blue-500/10 text-blue-400">
          <i data-lucide="activity" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Uptime do Motor</p>
          <h4 id="kpiUptime" class="text-lg font-bold text-white">--</h4>
        </div>
      </div>

      <div class="glass-card rounded-xl p-4 flex items-center space-x-4">
        <div class="p-3 rounded-xl bg-purple-500/10 text-purple-400">
          <i data-lucide="cpu" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Consumo de Memória</p>
          <h4 id="kpiMemory" class="text-lg font-bold text-white">-- MB</h4>
        </div>
      </div>

      <div class="glass-card rounded-xl p-4 flex items-center space-x-4">
        <div class="p-3 rounded-xl bg-amber-500/10 text-amber-400">
          <i data-lucide="headphones" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Áudio PTT & IA</p>
          <h4 class="text-lg font-bold text-emerald-400">Whisper Ativo</h4>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <div class="border-b border-slate-800 flex space-x-2 sm:space-x-8 overflow-x-auto text-sm font-semibold">
      <button onclick="switchTab('messenger')" id="btn-tab-messenger" class="tab-btn pb-3.5 px-2 border-b-2 border-brand-500 text-brand-400 flex items-center space-x-2">
        <i data-lucide="send" class="w-4 h-4"></i>
        <span>Disparador & Mensagens</span>
      </button>
      <button onclick="switchTab('transcription')" id="btn-tab-transcription" class="tab-btn pb-3.5 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2">
        <i data-lucide="mic" class="w-4 h-4"></i>
        <span>Central de Transcrição Whisper</span>
      </button>
      <button onclick="switchTab('instances')" id="btn-tab-instances" class="tab-btn pb-3.5 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2">
        <i data-lucide="layers" class="w-4 h-4"></i>
        <span>Todas as Instâncias</span>
      </button>
      <button onclick="switchTab('ai-controls')" id="btn-tab-ai-controls" class="tab-btn pb-3.5 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2">
        <i data-lucide="bot" class="w-4 h-4"></i>
        <span>Gestão de IA & Automação</span>
      </button>
      <button onclick="switchTab('mobile-app')" id="btn-tab-mobile-app" class="tab-btn pb-3.5 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center space-x-2">
        <i data-lucide="smartphone" class="w-4 h-4"></i>
        <span>Instalar App no Celular</span>
      </button>
    </div>

    <!-- TAB 1: DISPARADOR & MENSAGENS -->
    <div id="tab-messenger" class="tab-content space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Message Compose Form -->
        <div class="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 class="font-bold text-white text-base flex items-center gap-2">
                <i data-lucide="message-square-plus" class="w-5 h-5 text-brand-400"></i>
                Disparo Executivo de Mensagens
              </h3>
              <p class="text-xs text-slate-400">Envio prioritário pela sua instância <span class="text-brand-400 font-semibold font-mono">whatsapp_principal</span></p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Sessão Ativa</label>
              <select id="selectSession" class="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-brand-500 font-mono">
                <option value="whatsapp_principal">whatsapp_principal (Master)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Número de Destino (DDI + DDD + Telefone)</label>
              <input type="text" id="inputRecipient" placeholder="Ex: 5511999999999" class="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-brand-500 font-mono">
            </div>
          </div>

          <!-- Message Mode Tabs -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Formato de Envio</label>
            <div class="grid grid-cols-3 gap-2.5">
              <button onclick="setMode('text')" id="mode-text" class="py-2.5 px-3 rounded-xl border border-brand-500 bg-brand-500/10 text-brand-400 text-xs font-bold flex items-center justify-center gap-2">
                <i data-lucide="type" class="w-4 h-4"></i> Texto
              </button>
              <button onclick="setMode('audio')" id="mode-audio" class="py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                <i data-lucide="mic" class="w-4 h-4"></i> Áudio Voz (PTT)
              </button>
              <button onclick="setMode('image')" id="mode-image" class="py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                <i data-lucide="image" class="w-4 h-4"></i> Imagem
              </button>
            </div>
          </div>

          <!-- Text Field -->
          <div id="box-text" class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">Mensagem</label>
            <textarea id="textBody" rows="4" placeholder="Escreva o texto para o cliente ou contato..." class="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl p-3.5 w-full focus:outline-none focus:border-brand-500"></textarea>
          </div>

          <!-- Media URL Field -->
          <div id="box-media" class="hidden space-y-1.5">
            <label class="block text-xs font-semibold text-slate-300">URL Pública da Mídia (Áudio ou Foto)</label>
            <input type="url" id="mediaUrl" placeholder="https://dominio.com/audio.mp3" class="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-brand-500">
            <p id="pttHelp" class="text-[11px] text-brand-400 flex items-center gap-1.5 mt-1">
              <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
              Transcodificação FFmpeg Opus mono 16kHz ativada para reprodução de voz nativa no WhatsApp.
            </p>
          </div>

          <!-- Send Action Button -->
          <button onclick="executeSendMessage()" id="btnSend" class="w-full py-3.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25 transition">
            <i data-lucide="send" class="w-4 h-4"></i>
            <span>Enviar Mensagem Imediatamente</span>
          </button>
        </div>

        <!-- Real-time Console & Status -->
        <div class="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h4 class="font-bold text-white text-sm flex items-center gap-2">
                <i data-lucide="terminal" class="w-4 h-4 text-brand-400"></i>
                Console de Resposta
              </h4>
              <span class="text-[10px] text-slate-500 font-mono">REST 200 OK</span>
            </div>
            <div id="liveConsole" class="bg-exec-950 border border-slate-800/80 rounded-xl p-3.5 text-xs font-mono text-slate-400 h-64 overflow-y-auto">
              Pronto. Aguardando disparo de mensagem...
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <p class="font-bold text-slate-300 mb-1">Padrão Anti-Ban Corporativo:</p>
            O motor despacha via fila interna garantindo que rajadas de mensagens respeitem intervalos e conexões estáveis.
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: CENTRAL DE TRANSCRIÇÃO WHISPER -->
    <div id="tab-transcription" class="tab-content hidden space-y-4">
      <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 class="font-bold text-white text-base flex items-center gap-2">
              <i data-lucide="file-audio" class="w-5 h-5 text-brand-400"></i>
              Transcrições Integrais de Áudios de WhatsApp
            </h3>
            <p class="text-xs text-slate-400">Áudios longos, reuniões e notas de voz transcritos palavra por palavra sem cortes.</p>
          </div>
          <button onclick="fetchEvents()" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 transition">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Atualizar Feed
          </button>
        </div>

        <div id="transcriptionFeed" class="space-y-3">
          <div class="p-8 text-center text-slate-500 text-xs">
            Nenhum áudio recebido até o momento. Envie uma mensagem de voz para o número conectado para ver a transcrição imediata aqui.
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: TODAS AS INSTÂNCIAS -->
    <div id="tab-instances" class="tab-content hidden space-y-6">
      <div class="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-white text-base">Adicionar Sessão Secundária</h3>
          <p class="text-xs text-slate-400">Além da master, você pode gerenciar números adicionais (ex: comercial, suporte).</p>
        </div>
        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <input type="text" id="newInstId" placeholder="Ex: suporte-02" class="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 w-full sm:w-48 focus:outline-none focus:border-brand-500">
          <button onclick="createInstance()" class="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap">
            <i data-lucide="plus" class="w-4 h-4"></i> Criar Instância
          </button>
        </div>
      </div>

      <div id="instancesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- Rendered via JS -->
      </div>
    </div>

    <!-- TAB 4: GESTÃO DE IA & AUTOMAÇÃO -->
    <div id="tab-ai-controls" class="tab-content hidden space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="glass-panel rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 class="font-bold text-white text-base flex items-center gap-2">
              <i data-lucide="toggle-left" class="w-5 h-5 text-brand-400"></i>
              Modo de Operação
            </h4>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">Ativo</span>
          </div>
          <p class="text-xs text-slate-300">
            Alterne entre resposta autônoma por IA (Atlas) e modo exclusivo de atendimento humano manual.
          </p>
          <div class="space-y-2">
            <label class="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-brand-500 transition">
              <input type="radio" name="aiMode" value="auto" checked class="text-brand-500 focus:ring-0">
              <div>
                <span class="text-xs font-bold text-white block">Modo IA Ativo (Transbordo Inteligente)</span>
                <span class="text-[11px] text-slate-400">A IA responde dúvidas e encaminha para atendente humano quando solicitado.</span>
              </div>
            </label>
            <label class="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-brand-500 transition">
              <input type="radio" name="aiMode" value="manual" class="text-brand-500 focus:ring-0">
              <div>
                <span class="text-xs font-bold text-white block">Modo Apenas Humano (IA em Pausa)</span>
                <span class="text-[11px] text-slate-400">Todas as mensagens são recebidas sem intervenção automática de robô.</span>
              </div>
            </label>
          </div>
        </div>

        <div class="glass-panel rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 class="font-bold text-white text-base flex items-center gap-2">
              <i data-lucide="cpu" class="w-5 h-5 text-blue-400"></i>
              Motores de LLM Conectados
            </h4>
          </div>
          <div class="space-y-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p class="font-bold text-white">FreeLLMAPI Local Router</p>
                <p class="text-[11px] text-slate-400">Claude 3.5 Sonnet / Haiku (Custo Zero)</p>
              </div>
              <span class="text-emerald-400 font-bold">Online</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p class="font-bold text-white">Ollama Local Engine</p>
                <p class="text-[11px] text-slate-400">Qwen 2.5 3B & Coder 1.5B</p>
              </div>
              <span class="text-emerald-400 font-bold">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: INSTALAR NO CELULAR (PWA) -->
    <div id="tab-mobile-app" class="tab-content hidden space-y-6">
      <div class="glass-panel rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-6">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/25">
          <i data-lucide="smartphone" class="w-8 h-8 text-white"></i>
        </div>
        <div>
          <h3 class="text-xl font-extrabold text-white">Aplicativo na Tela do seu Celular</h3>
          <p class="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
            Transforme este painel no seu aplicativo nativo do dia a dia instalando o Progressive Web App (PWA) no seu smartphone.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h4 class="font-bold text-white text-xs sm:text-sm flex items-center gap-2 mb-2">
              <i data-lucide="apple" class="w-4 h-4 text-slate-300"></i> No iPhone / iPad (Safari)
            </h4>
            <ol class="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
              <li>Abra este painel no navegador Safari.</li>
              <li>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima).</li>
              <li>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
            </ol>
          </div>

          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h4 class="font-bold text-white text-xs sm:text-sm flex items-center gap-2 mb-2">
              <i data-lucide="play" class="w-4 h-4 text-emerald-400"></i> No Android (Chrome)
            </h4>
            <ol class="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
              <li>Abra este painel no Google Chrome.</li>
              <li>Toque no menu de <strong>3 pontinhos</strong> no canto superior.</li>
              <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

  </main>

  <script>
    const MASTER_SESSION = 'whatsapp_principal';
    const API_SECRET = 'sua_chave_mestra_secreta_aqui';
    let currentMode = 'text';

    function getHeaders() {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_SECRET
      };
    }

    function switchTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-brand-500', 'text-brand-400');
        btn.classList.add('border-transparent', 'text-slate-400');
      });
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

      const activeBtn = document.getElementById('btn-tab-' + tab);
      if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-slate-400');
        activeBtn.classList.add('border-brand-500', 'text-brand-400');
      }
      const activeContent = document.getElementById('tab-' + tab);
      if (activeContent) activeContent.classList.remove('hidden');

      if (tab === 'transcription') fetchEvents();
      if (tab === 'instances') fetchAllInstances();
      lucide.createIcons();
    }

    function setMode(mode) {
      currentMode = mode;
      document.querySelectorAll('[id^="mode-"]').forEach(b => {
        b.classList.remove('border-brand-500', 'bg-brand-500/10', 'text-brand-400');
        b.classList.add('border-slate-800', 'bg-slate-900', 'text-slate-400');
      });
      const active = document.getElementById('mode-' + mode);
      active.classList.remove('border-slate-800', 'bg-slate-900', 'text-slate-400');
      active.classList.add('border-brand-500', 'bg-brand-500/10', 'text-brand-400');

      if (mode === 'text') {
        document.getElementById('box-text').classList.remove('hidden');
        document.getElementById('box-media').classList.add('hidden');
      } else {
        document.getElementById('box-media').classList.remove('hidden');
        if (mode === 'audio') {
          document.getElementById('box-text').classList.add('hidden');
          document.getElementById('pttHelp').classList.remove('hidden');
        } else {
          document.getElementById('box-text').classList.remove('hidden');
          document.getElementById('pttHelp').classList.add('hidden');
        }
      }
      lucide.createIcons();
    }

    async function checkHealthAndMaster() {
      try {
        const [hRes, sRes] = await Promise.all([
          fetch('/health'),
          fetch('/sessions/' + MASTER_SESSION + '/status', { headers: getHeaders() })
        ]);

        if (hRes.ok) {
          const health = await hRes.json();
          document.getElementById('kpiUptime').innerText = Math.floor(health.uptimeSeconds / 60) + 'm ' + (health.uptimeSeconds % 60) + 's';
          document.getElementById('kpiMemory').innerText = (health.memory?.rssMB || 0) + ' MB';
        }

        if (sRes.ok) {
          const sJson = await sRes.json();
          const session = sJson.data;
          document.getElementById('kpiMasterStatus').innerText = session.status;

          if (session.status === 'CONNECTED') {
            document.getElementById('masterStatusBadge').className = 'flex items-center space-x-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold';
            document.getElementById('masterStatusText').innerText = 'WhatsApp Conectado com Sucesso (' + (session.phoneNumber || 'Ativo') + ')';
            document.getElementById('masterQrImage').parentElement.innerHTML = \`
              <div class="w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center text-center p-6 bg-slate-900/90 rounded-2xl border border-emerald-500/30">
                <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <i data-lucide="check" class="w-8 h-8"></i>
                </div>
                <h4 class="text-white font-bold text-base">WhatsApp Pareado</h4>
                <p class="text-xs text-slate-400 mt-1">Sua instância primária está 100% ativa e pronta para uso executivo.</p>
              </div>
            \`;
            lucide.createIcons();
          } else if (session.qrCode) {
            document.getElementById('masterQrImage').src = session.qrCode;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function refreshMasterQr() {
      try {
        document.getElementById('masterStatusText').innerText = 'Regerando QR Code...';
        await fetch('/sessions/' + MASTER_SESSION + '/start', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({})
        });
        setTimeout(checkHealthAndMaster, 2000);
      } catch (e) {
        alert('Erro ao reiniciar sessão master.');
      }
    }

    async function executeSendMessage() {
      const sessionId = document.getElementById('selectSession').value;
      const to = document.getElementById('inputRecipient').value.trim();
      const text = document.getElementById('textBody').value.trim();
      const mediaUrl = document.getElementById('mediaUrl').value.trim();
      const consoleBox = document.getElementById('liveConsole');

      if (!to) {
        alert('Informe o número de destino.');
        return;
      }

      const payload = { to: to, type: currentMode };
      if (currentMode === 'text') {
        if (!text) { alert('Digite o texto.'); return; }
        payload.text = text;
      } else if (currentMode === 'audio') {
        if (!mediaUrl) { alert('Informe a URL do áudio.'); return; }
        payload.mediaUrl = mediaUrl;
        payload.ptt = true;
      } else if (currentMode === 'image') {
        if (!mediaUrl) { alert('Informe a URL da imagem.'); return; }
        payload.mediaUrl = mediaUrl;
        payload.caption = text;
      }

      consoleBox.innerText = 'Despachando mensagem para ' + to + '...\\n' + JSON.stringify(payload, null, 2);

      try {
        const res = await fetch('/messages/' + sessionId + '/send', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        consoleBox.innerText = 'RESPOSTA DO SERVIDOR [' + res.status + ']:\\n' + JSON.stringify(json, null, 2);
      } catch (e) {
        consoleBox.innerText = 'Erro ao enviar: ' + e.message;
      }
    }

    async function fetchEvents() {
      try {
        const res = await fetch('/events/recent');
        const json = await res.json();
        const feed = document.getElementById('transcriptionFeed');
        const events = json.data || [];

        if (events.length === 0) {
          feed.innerHTML = '<div class="p-8 text-center text-slate-500 text-xs">Nenhum evento registrado ainda.</div>';
          return;
        }

        feed.innerHTML = events.map(ev => {
          return \`
            <div class="glass-card rounded-xl p-4 flex flex-col space-y-2 border border-slate-800">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-brand-400">\${ev.event}</span>
                <span class="text-slate-500 font-mono">\${new Date(ev.timestamp).toLocaleTimeString()}</span>
              </div>
              <div class="bg-exec-950 p-2.5 rounded-lg border border-slate-900 text-xs font-mono text-slate-300 overflow-x-auto">
                <pre class="whitespace-pre-wrap">\${JSON.stringify(ev.data, null, 2)}</pre>
              </div>
            </div>
          \`;
        }).join('');
        lucide.createIcons();
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchAllInstances() {
      try {
        const res = await fetch('/sessions', { headers: getHeaders() });
        const json = await res.json();
        const grid = document.getElementById('instancesGrid');
        const sessions = json.data || [];

        grid.innerHTML = sessions.map(s => \`
          <div class="glass-card rounded-xl p-5 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-white text-sm">\${s.sessionId}</h4>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700">\${s.status}</span>
            </div>
            <p class="text-xs text-slate-400 font-mono">\${s.phoneNumber || 'Sem número'}</p>
          </div>
        \`).join('');
        lucide.createIcons();
      } catch (e) {
        console.error(e);
      }
    }

    async function createInstance() {
      const id = document.getElementById('newInstId').value.trim();
      if (!id) return;
      await fetch('/sessions/' + id + '/start', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({})
      });
      document.getElementById('newInstId').value = '';
      fetchAllInstances();
    }

    // Auto-refresh interval (3 seconds)
    setInterval(checkHealthAndMaster, 3000);
    checkHealthAndMaster();
    lucide.createIcons();
  </script>
</body>
</html>`;
}
