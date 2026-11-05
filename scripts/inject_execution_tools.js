const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'generate_clean_html.js');
let code = fs.readFileSync(filePath, 'utf8');

console.log('Iniciando injeção das ferramentas de execução do GitHub...');

// 1. INJETAR DRIVER.JS NO HEAD
const headTarget = `<!-- HTML5 QR Code & Barcode Scanner Library via Webcam -->
  <script src="https://unpkg.com/html5-qrcode"></script>`;

const headReplacement = `<!-- HTML5 QR Code & Barcode Scanner Library via Webcam -->
  <script src="https://unpkg.com/html5-qrcode"></script>

  <!-- Driver.js para Onboarding e Tour Interativo (Padrão GitHub Top Tier) -->
  <script src="https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css"/>`;

if (code.includes(headTarget) && !code.includes('driver.js')) {
  code = code.replace(headTarget, headReplacement);
  console.log('✅ Driver.js injetado no <head>');
}

// 2. ADICIONAR BOTÃO DE TOUR NO TOPBAR
const topbarTarget = `<!-- Swagger Docs OpenAPI 3.0 Link -->`;

const topbarReplacement = `<!-- Tour Interativo do Cockpit (Driver.js) -->
        <button onclick="startSystemTour()" id="tourGuideBtn" class="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition text-xs font-bold" title="Iniciar Tour Guiado do Sistema (Driver.js)">
          <i data-lucide="compass" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>Tour Guiado</span>
        </button>

        <!-- Swagger Docs OpenAPI 3.0 Link -->`;

if (code.includes(topbarTarget) && !code.includes('startSystemTour()')) {
  code = code.replace(topbarTarget, topbarReplacement);
  console.log('✅ Botão de Tour Guiado adicionado ao Topbar');
}

// 3. ADICIONAR PAINEL DE GEOFENCING TURF NA TORRE DE CONTROLE
const geofenceTarget = `<!-- 3. RADAR DE INCIDENTES & TRANSMISSÃO EM LOTE -->`;

const geofenceReplacement = `<!-- NOVO: GEOFENCING DOS CENTROS DE DISTRIBUIÇÃO LOGGI (TURF.JS GEOENGINE) -->
        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-4" id="geofencingSectionCard">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <i data-lucide="shield-check" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
                  Cercas Virtuais dos CDs Loggi & Entrada de Carretas (Geofencing Turf)
                </h3>
                <p class="text-xs text-slate-400">Detecção perimétrica por satélite em torno de Cajamar, Leopoldina, Campinas e Pavuna.</p>
              </div>
            </div>
            <button onclick="loadGeofencesData()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl flex items-center gap-1.5 transition font-semibold">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-emerald-400"></i> Atualizar Cercas
            </button>
          </div>

          <!-- Cards das 4 Cercas Virtuais dos Polos -->
          <div id="geofencesHubsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Renderizado dinamicamente via JS -->
          </div>

          <!-- Tabela de Aproximação de Carretas e ETA para as Docas -->
          <div class="overflow-x-auto pt-2">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th class="py-2.5">Veículo</th>
                  <th class="py-2.5">Motorista</th>
                  <th class="py-2.5">Polo Mais Próximo</th>
                  <th class="py-2.5">Distância Cerca</th>
                  <th class="py-2.5">Status Perímetro</th>
                  <th class="py-2.5">ETA Previsto</th>
                  <th class="py-2.5">Doca Designada</th>
                </tr>
              </thead>
              <tbody id="geofenceVehiclesTableBody" class="divide-y divide-slate-800/50">
                <!-- Linhas dos veículos geradas via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. RADAR DE INCIDENTES & TRANSMISSÃO EM LOTE -->`;

if (code.includes(geofenceTarget) && !code.includes('geofencingSectionCard')) {
  code = code.replace(geofenceTarget, geofenceReplacement);
  console.log('✅ Painel de Geofencing Turf adicionado à Torre de Controle');
}

// 4. ADICIONAR LÓGICA JS: DRIVER.JS TOUR, GEOFENCING E ANTI-BAN
const jsTarget = `updateSoundscapeUI();`;

const jsNewToolsLogic = `// E. TOUR GUIADO INTERATIVO COM DRIVER.JS
    function startSystemTour() {
      if (typeof window.driver === 'undefined' && typeof window.driver?.js?.driver === 'undefined') {
        alert('Carregando biblioteca do Tour... Tente novamente em alguns segundos.');
        return;
      }

      playAtlasSound('click');

      const driverObj = window.driver.js.driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        nextBtnText: 'Próximo →',
        prevBtnText: '← Anterior',
        doneBtnText: 'Concluir Tour ✨',
        steps: [
          {
            element: '#adaptiveTopBar',
            popover: {
              title: '🌤️ Topbar Adaptativo & Clima Cajamar',
              description: 'Exibe a hora em tempo real, meteorologia oficial Open-Meteo do CD Cajamar e adapta dinamicamente o tema visual (sol, tarde, chuva, tempestade com canvas 60fps).'
            }
          },
          {
            element: '#commandPaletteModal',
            popover: {
              title: '⚡ Command Palette Global (Ctrl + K)',
              description: 'Pressione Ctrl + K para pesquisar instantaneamente entre os 4.041 contatos, 79 grupos Loggi, rastrear DANFEs e disparar comandos rápidos em milissegundos.'
            }
          },
          {
            element: '#railNav',
            popover: {
              title: '📱 Navegação Executiva & Feed de Grupos',
              description: 'Acesse conversas, feed consolidado dos 79 grupos com destaque para menções VIP (@Adimilson), Torre de Controle, Frota ao Vivo e Webhooks.'
            }
          },
          {
            element: '#viewSectionTower',
            popover: {
              title: '👑 Torre de Controle & Morning Briefing',
              description: 'Monitore os faróis de SLA, pacotes processados, dispare o Morning Briefing no Telegram em 1 clique e inspecione o Heatmap 7x24 da malha.'
            }
          },
          {
            element: '#geofencingSectionCard',
            popover: {
              title: '🛡️ Geofencing de CDs & Entrada em Docas',
              description: 'Cercas virtuais inteligentes por satélite nos polos Cajamar, Leopoldina, Campinas e Pavuna com cálculo automático de ETA e designação de docas.'
            }
          }
        ]
      });

      driverObj.drive();
    }

    // F. CARREGAMENTO DOS DADOS DE GEOFENCING TURF
    async function loadGeofencesData() {
      const hubsGrid = document.getElementById('geofencesHubsGrid');
      const tableBody = document.getElementById('geofenceVehiclesTableBody');
      if (!hubsGrid || !tableBody) return;

      try {
        const res = await fetch('/logistics/geofences');
        const json = await res.json();
        if (json.success) {
          // Renderiza cards dos polos
          hubsGrid.innerHTML = json.hubs.map(h => {
            return \`
              <div class="p-3.5 bg-obsidian-950 rounded-2xl border border-slate-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-white font-mono">\${h.code}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Raio \${h.radiusKm} km</span>
                </div>
                <div class="text-xs font-semibold text-slate-300">\${h.name}</div>
                <div class="pt-1 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span class="text-slate-400">Dentro da Cerca:</span>
                  <span class="font-bold text-emerald-400 font-mono">\${h.activeVehiclesInside} carreta(s)</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-400">Em Aproximação:</span>
                  <span class="font-bold text-amber-400 font-mono">\${h.vehiclesApproaching} carreta(s)</span>
                </div>
              </div>
            \`;
          }).join('');

          // Renderiza veículos na tabela
          tableBody.innerHTML = json.vehicles.map(v => {
            let statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">Em Trânsito</span>';
            if (v.status === 'INSIDE_ZONE') {
              statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> DENTRO DO POLO</span>';
            } else if (v.status === 'APPROACHING') {
              statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> APROXIMANDO</span>';
            }

            return \`
              <tr>
                <td class="py-2.5 font-mono font-bold text-sky-400">\${v.vehicleId}</td>
                <td class="py-2.5 font-semibold text-white">\${v.driverName}</td>
                <td class="py-2.5 text-slate-300">\${v.closestHub}</td>
                <td class="py-2.5 font-mono text-slate-400">\${v.distanceKm} km</td>
                <td class="py-2.5">\${statusBadge}</td>
                <td class="py-2.5 font-mono font-bold text-amber-300">\${v.etaMinutes !== null ? v.etaMinutes + ' min' : '--'}</td>
                <td class="py-2.5 font-mono font-bold text-emerald-400">\${v.assignedDock}</td>
              </tr>
            \`;
          }).join('');

          lucide.createIcons();
        }
      } catch (err) {
        console.warn('Erro ao carregar dados de geofencing:', err);
      }
    }

    // Carrega geofencing ao abrir a torre
    const prevLoadTowerData = window.loadTowerData;
    window.loadTowerData = async function() {
      if (typeof prevLoadTowerData === 'function') await prevLoadTowerData();
      loadGeofencesData();
    };

    updateSoundscapeUI();`;

if (code.includes(jsTarget) && !code.includes('startSystemTour()')) {
  code = code.replace(jsTarget, jsNewToolsLogic);
  console.log('✅ Funções JS de Driver.js Tour e Geofencing adicionadas');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ generate_clean_html.js atualizado com as ferramentas de execução!');
