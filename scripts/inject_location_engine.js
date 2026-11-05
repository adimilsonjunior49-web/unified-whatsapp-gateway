const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'generate_clean_html.js');
let code = fs.readFileSync(filePath, 'utf8');

console.log('Iniciando injeção do motor de localização dinâmica e modal de cidades...');

// 1. CORRIGIR O TEXTO HARDCODED '• Cajamar' NO FETCH WEATHER
const hardcodedWeatherTarget = `document.getElementById('weatherConditionDisplay').innerText = data.conditionLabel + ' • Cajamar';`;
const hardcodedWeatherReplacement = `document.getElementById('weatherConditionDisplay').innerText = data.conditionLabel + ' • ' + (data.city || 'Localização Atual');`;

if (code.includes(hardcodedWeatherTarget)) {
  code = code.replace(hardcodedWeatherTarget, hardcodedWeatherReplacement);
  console.log('✅ Removido Cajamar hardcoded de fetchLiveWeather');
}

// 2. ATUALIZAR O WEATHER BADGE NO TOPBAR PARA EXIBIR ÍCONE DE LOCALIZAÇÃO E CLIQUE PARA TROCAR LOCAL
const weatherBadgeTarget = `onclick="fetchLiveWeather(true)" title="Clique para atualizar previsão meteorológica agora"`;
const weatherBadgeReplacement = `onclick="openLocationModal()" title="Clique para alterar ou detectar sua localização atual (GPS / Cidades)"`;

if (code.includes(weatherBadgeTarget)) {
  code = code.replace(weatherBadgeTarget, weatherBadgeReplacement);
  console.log('✅ Badge meteorológico configurado para abrir o modal de localização');
}

// 3. ADICIONAR O MODAL DE LOCALIZAÇÃO E BUSCA DE CIDADES
const locationModalHtml = `<!-- =================================================================== -->
  <!-- MODAL: LOCALIZAÇÃO ATUAL & SELEÇÃO DE CIDADES / POLOS LOGGI        -->
  <!-- =================================================================== -->
  <div id="locationModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onclick="handleLocationModalBackdrop(event)">
    <div class="glass-card bg-obsidian-900 border border-sky-500/40 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <i data-lucide="map-pin" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-white text-base">Localização Atual & Clima</h3>
            <p class="text-[11px] text-sky-400">Selecione sua base operacional ou use o GPS real</p>
          </div>
        </div>
        <button onclick="closeLocationModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Botão GPS em Tempo Real -->
      <button onclick="detectDeviceGeolocation()" id="btnDetectGps" class="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/20">
        <i data-lucide="crosshair" class="w-4 h-4 animate-spin-slow"></i>
        <span>Detectar Minha Localização Exata via GPS / Navegador</span>
      </button>

      <!-- Busca de Qualquer Cidade Brasileira -->
      <div class="space-y-1.5 pt-1">
        <label class="text-[11px] font-semibold text-slate-400 block">Buscar Outra Cidade ou Estado</label>
        <div class="relative">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
          <input type="text" id="citySearchInput" oninput="searchCitiesDebounced()" placeholder="Digite o nome da cidade (ex: Barueri, São Paulo, Campinas)..." class="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition">
        </div>
        <div id="citySearchResults" class="space-y-1 max-h-36 overflow-y-auto text-xs hidden pt-1"></div>
      </div>

      <!-- Bases e Polos Rápidos da Loggi -->
      <div class="space-y-2 pt-2 border-t border-slate-800">
        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bases Operacionais Frequentes</label>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button onclick="selectPredefinedLocation('Barueri / SP', -23.5111, -46.8727)" class="p-2.5 rounded-xl bg-obsidian-950 hover:bg-obsidian-850 border border-slate-800 text-left transition flex items-center gap-2 group">
            <span class="w-2 h-2 rounded-full bg-sky-400"></span>
            <div>
              <div class="font-bold text-white group-hover:text-sky-300">Barueri / SP</div>
              <div class="text-[10px] text-slate-500">Sede Operacional</div>
            </div>
          </button>

          <button onclick="selectPredefinedLocation('Cajamar / SP', -23.3556, -46.8778)" class="p-2.5 rounded-xl bg-obsidian-950 hover:bg-obsidian-850 border border-slate-800 text-left transition flex items-center gap-2 group">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <div>
              <div class="font-bold text-white group-hover:text-emerald-300">CD Cajamar</div>
              <div class="text-[10px] text-slate-500">Cross-Docking Central</div>
            </div>
          </button>

          <button onclick="selectPredefinedLocation('Leopoldina / SP', -23.5329, -46.7264)" class="p-2.5 rounded-xl bg-obsidian-950 hover:bg-obsidian-850 border border-slate-800 text-left transition flex items-center gap-2 group">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <div>
              <div class="font-bold text-white group-hover:text-amber-300">Leopoldina / SP</div>
              <div class="text-[10px] text-slate-500">Polo Regional</div>
            </div>
          </button>

          <button onclick="selectPredefinedLocation('Campinas / SP', -22.9056, -47.0608)" class="p-2.5 rounded-xl bg-obsidian-950 hover:bg-obsidian-850 border border-slate-800 text-left transition flex items-center gap-2 group">
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            <div>
              <div class="font-bold text-white group-hover:text-purple-300">Campinas / SP</div>
              <div class="text-[10px] text-slate-500">Hub Interior</div>
            </div>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <span id="currentActiveLocationLabel">Local ativo: Carregando...</span>
        <button onclick="closeLocationModal()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition">Fechar</button>
      </div>
    </div>
  </div>`;

if (!code.includes('id="locationModal"')) {
  const insertTarget = '<!-- JAVASCRIPT MASTER -->';
  code = code.replace(insertTarget, locationModalHtml + '\n\n  ' + insertTarget);
  console.log('✅ Modal de Localização injetado no HTML');
}

// 4. ATUALIZAR A FUNÇÃO fetchLiveWeather() PARA SUPORTAR GPS E LOCALIZAÇÃO SALVA
const oldFetchWeatherCode = `async function fetchLiveWeather(isUserClick = false) {
      try {
        const res = await fetch('/api/weather');`;

const newFetchWeatherCode = `let activeUserCoords = null;
    try {
      const savedLoc = localStorage.getItem('atlas_custom_location');
      if (savedLoc) activeUserCoords = JSON.parse(savedLoc);
    } catch (_) {}

    async function fetchLiveWeather(isUserClick = false) {
      try {
        let weatherUrl = '/api/weather';
        if (activeUserCoords && activeUserCoords.lat && activeUserCoords.lon) {
          weatherUrl += '?lat=' + encodeURIComponent(activeUserCoords.lat) + '&lon=' + encodeURIComponent(activeUserCoords.lon) + '&city=' + encodeURIComponent(activeUserCoords.city || '');
        }

        const res = await fetch(weatherUrl);`;

if (code.includes(oldFetchWeatherCode)) {
  code = code.replace(oldFetchWeatherCode, newFetchWeatherCode);
  console.log('✅ fetchLiveWeather atualizado para usar coordenadas reais');
}

// 5. ADICIONAR FUNÇÕES DO MODAL DE LOCALIZAÇÃO NO JAVASCRIPT
const locationJsLogic = `// --- GESTÃO DINÂMICA DE LOCALIZAÇÃO ATUAL & GPS ---
    function openLocationModal() {
      const modal = document.getElementById('locationModal');
      if (modal) modal.classList.remove('hidden');
      updateCurrentLocationLabel();
      lucide.createIcons();
    }

    function closeLocationModal() {
      const modal = document.getElementById('locationModal');
      if (modal) modal.classList.add('hidden');
    }

    function handleLocationModalBackdrop(e) {
      closeLocationModal();
    }

    function updateCurrentLocationLabel() {
      const label = document.getElementById('currentActiveLocationLabel');
      if (!label) return;
      if (activeUserCoords && activeUserCoords.city) {
        label.innerText = 'Local ativo: ' + activeUserCoords.city;
      } else {
        label.innerText = 'Local ativo: Detecção Automática (IP / GPS)';
      }
    }

    function detectDeviceGeolocation() {
      if (!navigator.geolocation) {
        alert('Seu navegador não suporta geolocalização por satélite. Usando detecção automática por IP.');
        selectPredefinedLocation('Barueri / SP', -23.5111, -46.8727);
        return;
      }

      const btn = document.getElementById('btnDetectGps');
      if (btn) btn.innerText = 'Obtendo sinal GPS em tempo real...';

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          let cityName = 'Minha Localização (GPS)';

          try {
            // Tenta obter o nome da cidade via reverse geocode gratuito
            const rRes = await fetch(\`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=\${lat}&longitude=\${lon}&localityLanguage=pt\`);
            const rData = await rRes.json();
            if (rData && (rData.city || rData.locality)) {
              cityName = (rData.city || rData.locality) + ' / ' + (rData.principalSubdivisionCode || 'SP');
            }
          } catch (_) {}

          selectPredefinedLocation(cityName, lat, lon);
          if (btn) btn.innerHTML = '<i data-lucide=\"crosshair\" class=\"w-4 h-4\"></i><span>Detectar Minha Localização Exata via GPS</span>';
          lucide.createIcons();
        },
        (error) => {
          console.warn('Erro GPS:', error);
          alert('Não foi possível obter o GPS diretamente (' + error.message + '). Ativando Barueri / SP.');
          selectPredefinedLocation('Barueri / SP', -23.5111, -46.8727);
          if (btn) btn.innerHTML = '<i data-lucide=\"crosshair\" class=\"w-4 h-4\"></i><span>Detectar Minha Localização Exata via GPS</span>';
          lucide.createIcons();
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }

    function selectPredefinedLocation(cityName, lat, lon) {
      activeUserCoords = { city: cityName, lat, lon };
      try {
        localStorage.setItem('atlas_custom_location', JSON.stringify(activeUserCoords));
      } catch (_) {}
      updateCurrentLocationLabel();
      fetchLiveWeather(true);
      closeLocationModal();
      playAtlasSound('success');
    }

    let searchCityTimer = null;
    function searchCitiesDebounced() {
      clearTimeout(searchCityTimer);
      searchCityTimer = setTimeout(searchCitiesOnApi, 350);
    }

    async function searchCitiesOnApi() {
      const q = document.getElementById('citySearchInput')?.value.trim();
      const resultsContainer = document.getElementById('citySearchResults');
      if (!q || q.length < 2 || !resultsContainer) {
        if (resultsContainer) resultsContainer.classList.add('hidden');
        return;
      }

      try {
        const res = await fetch('/api/weather/search-city?q=' + encodeURIComponent(q));
        const json = await res.json();
        if (json.success && Array.isArray(json.results) && json.results.length > 0) {
          resultsContainer.classList.remove('hidden');
          resultsContainer.innerHTML = json.results.map(r => {
            return \`
              <div onclick=\"selectPredefinedLocation('\${r.name} / \${r.admin1}', \${r.latitude}, \${r.longitude})\" class=\"p-2 rounded-lg bg-obsidian-950 hover:bg-sky-950/40 border border-slate-800 cursor-pointer flex items-center justify-between transition\">
                <span class=\"font-semibold text-white\">\${r.name}</span>
                <span class=\"text-[10px] text-slate-400 font-mono\">\${r.admin1 || r.country}</span>
              </div>
            \`;
          }).join('');
        } else {
          resultsContainer.classList.remove('hidden');
          resultsContainer.innerHTML = '<div class=\"p-2 text-slate-500 text-center text-[11px]\">Nenhuma cidade encontrada.</div>';
        }
      } catch (_) {}
    }
`;

const jsAnchor = `// A. WEB AUDIO SOUNDSCAPE SINTETIZADOR NATIVO`;
if (code.includes(jsAnchor) && !code.includes('openLocationModal()')) {
  code = code.replace(jsAnchor, locationJsLogic + '\n\n    ' + jsAnchor);
  console.log('✅ Funções JS de Geolocalização dinâmica adicionadas');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ generate_clean_html.js atualizado com geolocalização dinâmica!');
