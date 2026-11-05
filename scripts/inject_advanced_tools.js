const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'generate_clean_html.js');
let code = fs.readFileSync(filePath, 'utf8');

console.log('Iniciando injeção das ferramentas avançadas do GitHub...');

// 1. ADICIONAR BOTÃO DE WEBHOOKS NA BARRA LATERAL (RAIL)
const railBtnTarget = `<!-- Telegram Bridge -->
        <a href="https://t.me/AtlasJuniorBot" target="_blank" class="p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-sky-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Abrir Torre Telegram (@AtlasJuniorBot)">
          <i data-lucide="send" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Telegram</span>
        </a>`;

const railBtnReplacement = `<!-- Webhooks & Integrations Engine (GitHub/Stripe style) -->
        <button onclick="switchMainView('webhooks')" id="railBtnWebhooks" class="rail-btn p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Webhooks & Integrações HMAC (n8n / ERP)">
          <i data-lucide="webhook" class="w-5 h-5 text-amber-400"></i>
          <span class="text-[9px] font-bold mt-1">Webhooks</span>
        </button>

        <!-- Telegram Bridge -->
        <a href="https://t.me/AtlasJuniorBot" target="_blank" class="p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-sky-400 hover:bg-obsidian-850 transition flex flex-col items-center group relative" title="Abrir Torre Telegram (@AtlasJuniorBot)">
          <i data-lucide="send" class="w-5 h-5"></i>
          <span class="text-[9px] font-bold mt-1">Telegram</span>
        </a>`;

if (code.includes(railBtnTarget) && !code.includes('railBtnWebhooks')) {
  code = code.replace(railBtnTarget, railBtnReplacement);
  console.log('✅ Botão de Webhooks adicionado à barra de navegação');
}

// 2. ADICIONAR COMMAND PALETTE, SWAGGER DOCS & SOUNDSCAPE NO ADAPTIVE TOPBAR
const topbarTarget = `<!-- Badge Meteorológico em Tempo Real & Alerta de Pista -->
      <div class="flex items-center space-x-2 sm:space-x-3">`;

const topbarReplacement = `<!-- Barra de Pesquisa Rápida / Command Palette Trigger (Estilo Raycast / VS Code) -->
      <div class="flex items-center space-x-2">
        <button onclick="toggleCommandPalette()" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-slate-700/60 text-slate-300 hover:text-white hover:border-sky-500/50 transition cursor-pointer text-xs font-semibold shadow-inner group">
          <i data-lucide="command" class="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform"></i>
          <span>Buscar ou Comando...</span>
          <kbd class="px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-slate-400 group-hover:text-sky-300">Ctrl K</kbd>
        </button>

        <!-- Swagger Docs OpenAPI 3.0 Link -->
        <a href="/documentation" target="_blank" class="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition text-xs font-bold" title="Abrir Swagger / OpenAPI 3.0 Documentation">
          <i data-lucide="file-code" class="w-3.5 h-3.5"></i>
          <span>Swagger Docs</span>
        </a>

        <!-- Soundscape Toggle (Web Audio API) -->
        <button id="soundscapeToggleBtn" onclick="toggleSoundscape()" class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition text-xs font-bold" title="Alternar Efeitos Sonoros Hápticos (Web Audio API)">
          <span id="soundscapeIcon">🔊</span>
          <span class="hidden xl:inline text-[11px]" id="soundscapeLabel">Sons Ativos</span>
        </button>
      </div>

      <!-- Badge Meteorológico em Tempo Real & Alerta de Pista -->
      <div class="flex items-center space-x-2 sm:space-x-3">`;

if (code.includes(topbarTarget) && !code.includes('toggleCommandPalette()')) {
  code = code.replace(topbarTarget, topbarReplacement);
  console.log('✅ Command Palette, Swagger Docs e Soundscape adicionados ao Topbar');
}

// 3. ADICIONAR O ACTIVITY HEATMAP 7X24 NA TORRE DE CONTROLE
const towerHeatmapTarget = `<!-- 2. PAINÉIS DOS POLOS REGIONAIS DA MALHA LOGGI -->
        <div>
          <h3 class="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
            <i data-lucide="warehouse" class="w-4 h-4 text-sky-400"></i>
            Painéis Regionais & Status de Expedição das Docas
          </h3>
          <div id="hubsCardsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Hubs renderizados via JavaScript -->
          </div>
        </div>`;

const towerHeatmapReplacement = `<!-- NOVO: ACTIVITY HEATMAP 7x24 ESTILO GITHUB (Densidade Operacional da Malha Loggi) -->
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
                <i data-lucide="flame" class="w-4 h-4 text-emerald-400"></i>
                Mapa de Calor Operacional 7x24 (Estilo GitHub Contribution Activity)
              </h3>
              <p class="text-xs text-slate-400">Densidade de mensagens nos 56 grupos e movimentação horária de carretas na malha.</p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-[11px] text-slate-400">Escala de Intensidade:</span>
              <div class="flex items-center space-x-1">
                <span class="w-3 h-3 rounded-sm bg-obsidian-950 border border-white/10" title="Vazio / Repouso"></span>
                <span class="w-3 h-3 rounded-sm bg-emerald-950 border border-emerald-800" title="Atividade Baixa"></span>
                <span class="w-3 h-3 rounded-sm bg-emerald-800 border border-emerald-600" title="Atividade Moderada"></span>
                <span class="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-400" title="Atividade Alta"></span>
                <span class="w-3 h-3 rounded-sm bg-emerald-400 shadow-sm shadow-emerald-400/50" title="Pico Crítico (Cajamar Sorters)"></span>
              </div>
            </div>
          </div>

          <!-- Grade Matricial do Heatmap -->
          <div class="overflow-x-auto pb-2">
            <div class="min-w-[760px]">
              <div class="flex items-center mb-1 text-[10px] text-slate-500 font-mono">
                <div class="w-10"></div>
                <div class="flex-1 grid grid-cols-24 text-center">
                  <span>00</span><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span>
                  <span>06</span><span>07</span><span>08</span><span>09</span><span>10</span><span>11</span>
                  <span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span>
                  <span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span>
                </div>
              </div>
              <div id="heatmapGridContainer" class="space-y-1">
                <!-- Linhas dos 7 dias geradas dinamicamente -->
              </div>
            </div>
          </div>
          <div id="heatmapTooltipInfo" class="text-xs text-slate-400 p-2.5 rounded-xl bg-obsidian-950/80 border border-slate-800/80 flex items-center justify-between">
            <span id="heatmapTooltipText">Passe o cursor sobre os blocos para inspecionar os turnos e volumes.</span>
            <span class="text-emerald-400 font-bold font-mono text-[11px]" id="heatmapTotalVolumeDisplay">--</span>
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
        </div>`;

if (code.includes(towerHeatmapTarget) && !code.includes('heatmapGridContainer')) {
  code = code.replace(towerHeatmapTarget, towerHeatmapReplacement);
  console.log('✅ Activity Heatmap 7x24 adicionado à Torre de Controle');
}

// 4. ADICIONAR VIEW SECTION WEBHOOKS (VIEW J)
const viewsInsertionTarget = `<!-- =================================================================== -->
      <!-- VIEW D: MAPA DA FROTA EM TEMPO REAL (LEAFLET / LOGISTICS)           -->`;

const webhooksViewHtml = `<!-- =================================================================== -->
      <!-- VIEW J: CENTRAL DE WEBHOOKS & INTEGRAÇÕES (PADRÃO GITHUB / STRIPE)  -->
      <!-- =================================================================== -->
      <div id="viewSectionWebhooks" class="hidden flex-1 flex flex-col bg-obsidian-950 p-6 overflow-y-auto space-y-6">
        <div class="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <i data-lucide="webhook" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-extrabold text-white">Central de Webhooks & Integrações</h2>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> HMAC-SHA256 SIGNED
                </span>
              </div>
              <p class="text-xs text-slate-400">Notifique o n8n, Zapier, Webhook.site ou ERP Loggi em tempo real com assinatura criptográfica de integridade.</p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button onclick="loadWebhooksList()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition font-semibold">
              <i data-lucide="rotate-cw" class="w-3.5 h-3.5 text-amber-400"></i> Atualizar Webhooks
            </button>
          </div>
        </div>

        <!-- Formulário de Cadastro de Novo Webhook -->
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-400"></i>
            Cadastrar Novo Endpoint de Webhook
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="md:col-span-2">
              <label class="text-[11px] font-semibold text-slate-400 block mb-1">URL de Destino (HTTPS recomendado) *</label>
              <input type="url" id="newWebhookUrl" placeholder="https://seu-servidor-n8n.com/webhook/loggi-atlas" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition">
            </div>
            <div>
              <label class="text-[11px] font-semibold text-slate-400 block mb-1">Eventos Inscritos</label>
              <select id="newWebhookEvents" class="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition">
                <option value="*">Todos os Eventos (*)</option>
                <option value="message.upsert">Novas Mensagens (WhatsApp)</option>
                <option value="receipt.created">Canhotos OCR Auditados</option>
                <option value="vip.mentioned">Menções VIP (@Adimilson)</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end">
            <button onclick="createNewWebhook()" id="btnSaveWebhook" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20">
              <i data-lucide="check" class="w-4 h-4"></i> Salvar & Gerar Chave HMAC
            </button>
          </div>
        </div>

        <!-- Lista de Webhooks Ativos -->
        <div class="space-y-3">
          <h3 class="text-sm font-extrabold text-white flex items-center justify-between">
            <span class="flex items-center gap-2">
              <i data-lucide="radio" class="w-4 h-4 text-sky-400"></i>
              Endpoints Registrados
            </span>
            <span id="webhooksCountBadge" class="text-xs text-slate-400 font-mono">0 ativos</span>
          </h3>
          <div id="webhooksCardsContainer" class="space-y-3">
            <!-- Cards de webhooks renderizados via JS -->
          </div>
        </div>

        <!-- Tabela de Auditoria das Últimas Entregas -->
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
            <i data-lucide="activity" class="w-4 h-4 text-purple-400"></i>
            Histórico das Últimas Entregas de Webhooks
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th class="py-2.5">Horário</th>
                  <th class="py-2.5">Evento</th>
                  <th class="py-2.5">Status HTTP</th>
                  <th class="py-2.5">Resultado</th>
                </tr>
              </thead>
              <tbody id="webhookDeliveriesTableBody" class="divide-y divide-slate-800/50">
                <tr><td colspan="4" class="text-center py-6 text-slate-500">Nenhum disparo registrado ainda.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>\n\n      ` + viewsInsertionTarget;

if (code.includes(viewsInsertionTarget) && !code.includes('viewSectionWebhooks')) {
  code = code.replace(viewsInsertionTarget, webhooksViewHtml);
  console.log('✅ View de Webhooks e Integrações adicionada');
}

// 5. ADICIONAR MODAL DO COMMAND PALETTE (RAYCAST / LINEAR STYLE)
const modalInsertionTarget = `<!-- JAVASCRIPT MASTER -->`;

const commandPaletteModalHtml = `<!-- =================================================================== -->
  <!-- COMMAND PALETTE MODAL (CTRL + K - ESTILO RAYCAST / LINEAR / GITHUB)  -->
  <!-- =================================================================== -->
  <div id="commandPaletteModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4" onclick="handleCommandPaletteBackdrop(event)">
    <div class="glass-card bg-obsidian-900 border border-sky-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[75vh]" onclick="event.stopPropagation()">
      
      <!-- Input de Busca Rápida -->
      <div class="p-4 border-b border-slate-800 flex items-center space-x-3 bg-obsidian-950/80">
        <i data-lucide="command" class="w-5 h-5 text-sky-400"></i>
        <input type="text" id="commandPaletteInput" oninput="handleCommandPaletteSearch()" placeholder="Digite para buscar contatos, grupos, NFs ou ações do sistema..." class="w-full bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none font-medium">
        <kbd class="px-2 py-1 rounded bg-obsidian-850 border border-white/10 text-[10px] font-mono text-slate-400">ESC</kbd>
      </div>

      <!-- Resultados da Busca -->
      <div id="commandPaletteResults" class="p-3 overflow-y-auto space-y-4 max-h-[55vh] text-xs">
        <!-- Renderizado dinamicamente via JS -->
      </div>

      <!-- Footer com Atalhos -->
      <div class="px-4 py-2.5 bg-obsidian-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <div class="flex items-center space-x-3">
          <span><kbd class="px-1 bg-obsidian-800 rounded border border-white/10">↑</kbd> <kbd class="px-1 bg-obsidian-800 rounded border border-white/10">↓</kbd> Navegar</span>
          <span><kbd class="px-1.5 bg-obsidian-800 rounded border border-white/10">↵</kbd> Executar</span>
        </div>
        <span class="text-sky-400 font-semibold">Atlas Command Engine</span>
      </div>
    </div>
  </div>\n\n  ` + modalInsertionTarget;

if (code.includes(modalInsertionTarget) && !code.includes('commandPaletteModal')) {
  code = code.replace(modalInsertionTarget, commandPaletteModalHtml);
  console.log('✅ Modal do Command Palette adicionado ao HTML');
}

// 6. ADICIONAR LÓGICA JAVASCRIPT DAS 5 FERRAMENTAS AVANÇADAS
const jsSwitchViewTarget = `const views = ['chats', 'contacts', 'groupfeed', 'tower', 'fleet', 'receipts', 'telephony', 'news'];`;
const jsSwitchViewReplacement = `const views = ['chats', 'contacts', 'groupfeed', 'tower', 'fleet', 'receipts', 'telephony', 'news', 'webhooks'];`;

if (code.includes(jsSwitchViewTarget)) {
  code = code.replace(jsSwitchViewTarget, jsSwitchViewReplacement);
}

const jsViewConditionTarget = `} else if (view === 'news') {
        document.getElementById('viewSectionNews').classList.remove('hidden');
        loadNewsArticles();
      }`;

const jsViewConditionReplacement = `} else if (view === 'news') {
        document.getElementById('viewSectionNews').classList.remove('hidden');
        loadNewsArticles();
      } else if (view === 'webhooks') {
        document.getElementById('viewSectionWebhooks').classList.remove('hidden');
        loadWebhooksList();
      }`;

if (code.includes(jsViewConditionTarget) && !code.includes(`view === 'webhooks'`)) {
  code = code.replace(jsViewConditionTarget, jsViewConditionReplacement);
}

// Injeção de funções JS no final antes de lucide.createIcons();
const jsInitTarget = `// INICIALIZAÇÃO
    startRealtimeClock();`;

const jsNewToolsCode = `// =========================================================================
    // FERRAMENTAS AVANÇADAS GITHUB: SOUNDSCAPE, COMMAND PALETTE, HEATMAP & WEBHOOKS
    // =========================================================================

    // A. WEB AUDIO SOUNDSCAPE SINTETIZADOR NATIVO
    let soundscapeEnabled = localStorage.getItem('atlas_soundscape_enabled') !== 'false';

    function toggleSoundscape() {
      soundscapeEnabled = !soundscapeEnabled;
      localStorage.setItem('atlas_soundscape_enabled', soundscapeEnabled);
      updateSoundscapeUI();
      if (soundscapeEnabled) playAtlasSound('ping');
    }

    function updateSoundscapeUI() {
      const icon = document.getElementById('soundscapeIcon');
      const label = document.getElementById('soundscapeLabel');
      if (icon) icon.innerText = soundscapeEnabled ? '🔊' : '🔇';
      if (label) label.innerText = soundscapeEnabled ? 'Sons Ativos' : 'Sons Mudos';
    }

    function playAtlasSound(type = 'ping') {
      if (!soundscapeEnabled) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        if (type === 'ping') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'success') {
          // Acorde Dó Maior harmônico (C5, E5, G5)
          [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
            gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.05);
            osc.stop(ctx.currentTime + 0.45);
          });
        } else if (type === 'ptt') {
          // Beep duplo analógico estilo rádio comunicador / Nextel
          [750, 950].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
            gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.07);
            osc.stop(ctx.currentTime + idx * 0.07 + 0.06);
          });
        } else if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, ctx.currentTime);
          gain.gain.setValueAtTime(0.03, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.02);
        }
      } catch (_) {}
    }

    // B. COMMAND PALETTE (CTRL + K)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      } else if (e.key === 'Escape') {
        closeCommandPalette();
      }
    });

    function toggleCommandPalette() {
      const modal = document.getElementById('commandPaletteModal');
      if (modal.classList.contains('hidden')) {
        openCommandPalette();
      } else {
        closeCommandPalette();
      }
    }

    function openCommandPalette() {
      const modal = document.getElementById('commandPaletteModal');
      const input = document.getElementById('commandPaletteInput');
      modal.classList.remove('hidden');
      input.value = '';
      playAtlasSound('click');
      setTimeout(() => input.focus(), 50);
      handleCommandPaletteSearch();
      lucide.createIcons();
    }

    function closeCommandPalette() {
      const modal = document.getElementById('commandPaletteModal');
      if (modal) modal.classList.add('hidden');
    }

    function handleCommandPaletteBackdrop(e) {
      closeCommandPalette();
    }

    function handleCommandPaletteSearch() {
      const query = (document.getElementById('commandPaletteInput')?.value || '').toLowerCase().trim();
      const container = document.getElementById('commandPaletteResults');
      if (!container) return;

      const actions = [
        { id: 'act_morning', title: 'Disparar Morning Briefing no Telegram', category: 'Ações Rápidas', icon: 'sun', run: () => { closeCommandPalette(); openMorningBriefingModal(); } },
        { id: 'act_exp_cont', title: 'Exportar Agenda em Planilha Excel (CSV)', category: 'Exportações', icon: 'file-spreadsheet', run: () => { window.location.href = '/contacts/export.csv'; closeCommandPalette(); playAtlasSound('success'); } },
        { id: 'act_exp_rec', title: 'Exportar Relatório de Canhotos OCR', category: 'Exportações', icon: 'file-check-2', run: () => { window.location.href = '/receipts/export.csv'; closeCommandPalette(); playAtlasSound('success'); } },
        { id: 'act_swagger', title: 'Abrir Documentação Swagger / OpenAPI 3.0', category: 'Desenvolvimento', icon: 'file-code', run: () => { window.open('/documentation', '_blank'); closeCommandPalette(); } },
        { id: 'act_scanner', title: 'Escanear Código DANFE / Barras com Câmera', category: 'Logística', icon: 'scan-barcode', run: () => { closeCommandPalette(); openScannerModal(); } },
        { id: 'act_phone', title: 'Abrir Discador Telefônico WebRTC', category: 'Telefonia', icon: 'phone-call', run: () => { closeCommandPalette(); switchMainView('telephony'); } },
        { id: 'act_meeting', title: 'Iniciar Reunião Operacional WebRTC', category: 'Comunicação', icon: 'video', run: () => { closeCommandPalette(); openMeetingModal(); } },
        { id: 'act_webhooks', title: 'Gerenciar Webhooks & Integrações HMAC', category: 'Integrações', icon: 'webhook', run: () => { closeCommandPalette(); switchMainView('webhooks'); } },
        { id: 'act_backup', title: 'Executar Backup Atômico do Banco SQLite', category: 'Segurança', icon: 'database', run: () => { closeCommandPalette(); performDbBackup(); } }
      ];

      const filteredActions = actions.filter(a => a.title.toLowerCase().includes(query) || a.category.toLowerCase().includes(query));

      // Filtra contatos da memória se houver query
      const matchingContacts = query.length >= 2 ? allChats.filter(c => (c.name || '').toLowerCase().includes(query) || (c.jid || '').toLowerCase().includes(query)).slice(0, 5) : [];

      let html = '';

      if (filteredActions.length > 0) {
        html += '<div class="space-y-1"><div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Comandos do Sistema</div>';
        filteredActions.forEach(a => {
          html += \`
            <div onclick="window['\${a.id}']()" class="p-2.5 rounded-xl hover:bg-obsidian-800 cursor-pointer flex items-center justify-between group transition">
              <div class="flex items-center space-x-3">
                <div class="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <i data-lucide="\${a.icon}" class="w-4 h-4"></i>
                </div>
                <span class="font-semibold text-white group-hover:text-sky-300 transition">\${a.title}</span>
              </div>
              <span class="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-black/40 border border-white/5">\${a.category}</span>
            </div>
          \`;
          window[a.id] = a.run;
        });
        html += '</div>';
      }

      if (matchingContacts.length > 0) {
        html += '<div class="space-y-1 pt-2 border-t border-slate-800"><div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Conversas e Grupos</div>';
        matchingContacts.forEach(c => {
          html += \`
            <div onclick="selectChatFromPalette('\${c.jid}')" class="p-2.5 rounded-xl hover:bg-obsidian-800 cursor-pointer flex items-center justify-between group transition">
              <div class="flex items-center space-x-3">
                <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  \${c.isGroup ? 'G' : 'C'}
                </div>
                <div>
                  <div class="font-semibold text-white group-hover:text-emerald-300 transition">\${escapeHtml(c.name)}</div>
                  <div class="text-[10px] text-slate-500 font-mono">\${c.jid}</div>
                </div>
              </div>
              <span class="text-[10px] text-emerald-400 font-bold">\${c.category || 'LOGGI'}</span>
            </div>
          \`;
        });
        html += '</div>';
      }

      if (!html) {
        html = '<div class="text-center py-8 text-slate-500 text-xs">Nenhum comando ou contato encontrado para "' + escapeHtml(query) + '".</div>';
      }

      container.innerHTML = html;
      lucide.createIcons();
    }

    function selectChatFromPalette(jid) {
      closeCommandPalette();
      switchMainView('chats');
      openChatConversation(jid);
    }

    // C. ACTIVITY HEATMAP (ESTILO GITHUB 7x24)
    async function loadActivityHeatmap() {
      const container = document.getElementById('heatmapGridContainer');
      if (!container) return;

      try {
        const res = await fetch('/tower/activity-heatmap');
        const json = await res.json();
        if (json.success && Array.isArray(json.matrix)) {
          document.getElementById('heatmapTotalVolumeDisplay').innerText = json.totalActivity.toLocaleString('pt-BR') + ' EVENTOS NA SEMANA';

          container.innerHTML = json.days.map((day, dIdx) => {
            const rowValues = json.matrix[dIdx] || [];
            const cellsHtml = rowValues.map((val, hIdx) => {
              let colorClass = 'bg-obsidian-950 border border-white/5';
              if (val > 180) colorClass = 'bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-400/50';
              else if (val > 120) colorClass = 'bg-emerald-600 border border-emerald-500';
              else if (val > 70) colorClass = 'bg-emerald-800 border border-emerald-700';
              else if (val > 0) colorClass = 'bg-emerald-950 border border-emerald-900';

              const hourLabel = String(hIdx).padStart(2, '0') + ':00';
              return \`<div class="h-4 rounded-sm \${colorClass} cursor-pointer transition hover:scale-125" onmouseover="showHeatmapCellTooltip('\${day}', '\${hourLabel}', \${val})" title="\${day} às \${hourLabel}: \${val} eventos"></div>\`;
            }).join('');

            return \`
              <div class="flex items-center space-x-2">
                <span class="w-10 text-[10px] font-mono font-bold text-slate-400">\${day}</span>
                <div class="flex-1 grid grid-cols-24 gap-1">\${cellsHtml}</div>
              </div>
            \`;
          }).join('');
        }
      } catch (err) {
        console.warn('Erro ao carregar heatmap:', err);
      }
    }

    function showHeatmapCellTooltip(day, hour, val) {
      const el = document.getElementById('heatmapTooltipText');
      if (el) {
        el.innerHTML = \`<strong class="text-white">\${day} às \${hour}:</strong> <span class="text-emerald-400 font-bold">\${val} pacotes/mensagens</span> processados pelos sorters e docas.\`;
      }
    }

    // D. GESTÃO DE WEBHOOKS COM ASSINATURA HMAC-SHA256
    async function loadWebhooksList() {
      const container = document.getElementById('webhooksCardsContainer');
      const tableBody = document.getElementById('webhookDeliveriesTableBody');
      if (!container) return;

      try {
        const res = await fetch('/webhooks');
        const json = await res.json();
        if (json.success && Array.isArray(json.webhooks)) {
          document.getElementById('webhooksCountBadge').innerText = json.count + ' endpoint(s)';

          if (json.webhooks.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-slate-500 text-xs">Nenhum webhook registrado. Cadastre acima para integrar ao n8n, Zapier ou ERP.</div>';
          } else {
            container.innerHTML = json.webhooks.map(w => {
              return \`
                <div class="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-extrabold text-white text-xs font-mono">\${w.id}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold \${w.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">\${w.status}</span>
                      </div>
                      <div class="text-xs text-sky-400 font-semibold mt-1 break-all">\${w.url}</div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button onclick="testWebhookDispatch('\${w.id}', '\${w.url}', '\${w.secret}')" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1">
                        <i data-lucide="send" class="w-3.5 h-3.5"></i> Testar Ping
                      </button>
                      <button onclick="deleteWebhookItem('\${w.id}')" class="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-xl transition" title="Excluir Webhook">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>

                  <div class="p-2.5 bg-obsidian-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <div class="text-slate-400">HMAC Secret: <span class="text-amber-400">\${w.secret.substring(0, 10)}****************</span></div>
                    <button onclick="navigator.clipboard.writeText('\${w.secret}'); alert('Secret copiado para o clipboard!');" class="text-slate-400 hover:text-white transition">Copiar</button>
                  </div>
                </div>
              \`;
            }).join('');
          }

          if (tableBody && Array.isArray(json.recentDeliveries)) {
            if (json.recentDeliveries.length === 0) {
              tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-slate-500">Nenhum disparo registrado ainda. Clique em "Testar Ping" para verificar.</td></tr>';
            } else {
              tableBody.innerHTML = json.recentDeliveries.map(d => {
                const dt = d.dispatched_at ? new Date(d.dispatched_at * 1000).toLocaleTimeString('pt-BR') : '';
                return \`
                  <tr>
                    <td class="py-2.5 font-mono text-slate-400">\${dt}</td>
                    <td class="py-2.5 font-semibold text-white">\${d.event}</td>
                    <td class="py-2.5 font-mono font-bold \${d.success ? 'text-emerald-400' : 'text-rose-400'}">HTTP \${d.status_code || 0}</td>
                    <td class="py-2.5">\${d.success ? '<span class="text-emerald-400 font-bold">SUCESSO</span>' : '<span class="text-rose-400 font-bold">FALHA</span>'}</td>
                  </tr>
                \`;
              }).join('');
            }
          }

          lucide.createIcons();
        }
      } catch (err) {
        console.warn('Erro ao carregar webhooks:', err);
      }
    }

    async function createNewWebhook() {
      const urlInput = document.getElementById('newWebhookUrl');
      const eventsSelect = document.getElementById('newWebhookEvents');
      const url = urlInput ? urlInput.value.trim() : '';
      if (!url) {
        alert('Digite a URL do webhook.');
        return;
      }

      const events = [eventsSelect ? eventsSelect.value : '*'];
      const btn = document.getElementById('btnSaveWebhook');
      btn.disabled = true;

      try {
        const res = await fetch('/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, events })
        });
        const json = await res.json();
        if (json.success) {
          alert('✅ Webhook cadastrado com sucesso! Chave HMAC gerada e ativa.');
          urlInput.value = '';
          loadWebhooksList();
          playAtlasSound('success');
        } else {
          alert('Erro ao criar webhook: ' + json.error);
        }
      } catch (_) {
        alert('Erro ao conectar ao servidor.');
      } finally {
        btn.disabled = false;
      }
    }

    async function deleteWebhookItem(id) {
      if (!confirm('Deseja excluir este webhook?')) return;
      try {
        await fetch('/webhooks/' + id, { method: 'DELETE' });
        loadWebhooksList();
        playAtlasSound('click');
      } catch (_) {
        alert('Erro ao excluir webhook.');
      }
    }

    async function testWebhookDispatch(id, url, secret) {
      try {
        const res = await fetch('/webhooks/test-dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhookId: id, url, secret })
        });
        const json = await res.json();
        alert(json.message || 'Disparo finalizado.');
        loadWebhooksList();
        if (json.success) playAtlasSound('success');
      } catch (_) {
        alert('Erro na chamada do teste de webhook.');
      }
    }

    // Chamada inicial de atualização da Torre para incluir o Heatmap
    const originalLoadTowerData = window.loadTowerData;
    window.loadTowerData = async function() {
      if (typeof originalLoadTowerData === 'function') await originalLoadTowerData();
      loadActivityHeatmap();
    };

    updateSoundscapeUI();

    ` + jsInitTarget;

if (code.includes(jsInitTarget) && !code.includes('toggleSoundscape()')) {
  code = code.replace(jsInitTarget, jsNewToolsCode);
  console.log('✅ Lógica JavaScript das ferramentas avançadas adicionada');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ generate_clean_html.js atualizado com sucesso!');
