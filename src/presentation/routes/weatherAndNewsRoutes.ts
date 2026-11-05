import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';

interface WeatherCache {
  data: any;
  timestamp: number;
}

let weatherCache: WeatherCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de cache

export interface NewsArticle {
  id: string;
  title: string;
  category: 'LOGGI' | 'AI' | 'HIGHWAY' | 'TECH';
  categoryLabel: string;
  badgeColor: string;
  readTime: string;
  publishedAt: string;
  source: string;
  summary: string;
  keyTakeaway: string;
  content: string;
}

export const NEWS_DATABASE: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Loggi amplia operação de Cross-Docking em Cajamar com automação por sorters de alta velocidade',
    category: 'LOGGI',
    categoryLabel: 'Logística & Loggi',
    badgeColor: 'sky',
    readTime: '2 min de leitura',
    publishedAt: 'Hoje às 19:45',
    source: 'Radar Loggi Operações',
    summary: 'O centro de distribuição central de Cajamar alcançou marca histórica no processamento de remessas com os novos sorters automatizados e integração direta às docas de carretas SP-RJ.',
    keyTakeaway: 'Janela de expedição estendida e redução do tempo de triagem de 45 para 12 minutos por gaiola.',
    content: `A central de Cajamar da Loggi concluiu a ativação da nova linha de sorters automatizados de alta vazão, permitindo que carretas de transferência das rotas SP-RJ, SP-Curitiba e SP-Belo Horizonte sejam carregadas em tempo recorde.
As carretas operam prioritariamente nas Docas 01 a 06, onde leitores óticos de código de barras fazem a conferência contínua dos pacotes. O horário limite de corte (Cutoff) para remessas expressas permanece às 19h30, com transferência noturna garantida.`
  },
  {
    id: 'news-2',
    title: 'Agentes Autônomos de IA no WhatsApp revolucionam o despacho de frotas e suporte a motoristas',
    category: 'AI',
    categoryLabel: 'Inteligência Artificial',
    badgeColor: 'purple',
    readTime: '3 min de leitura',
    publishedAt: 'Hoje às 18:20',
    source: 'AI Supply Chain Review',
    summary: 'Modelos de linguagem avançados com raciocínio contextual e sem custos de API externa estão assumindo a triagem operacional, reduzindo o tempo de resposta a frotistas para menos de 2 segundos.',
    keyTakeaway: 'Respostas 100% humanizadas com empatia e precisão técnica operacional, sem parecer robô.',
    content: `A integração de agentes autônomos locais (como Whisper para transcrição e modelos de alta velocidade) no WhatsApp operacional das transportadoras está transformando a comunicação com a ponta da cadeia.
Diferente de chatbots antiquados com menus numéricos rígidos, os novos agentes compreendem contexto, fotos de comprovantes e áudios de motoristas em rodovia, fornecendo direcionamento imediato para docas, procedimentos de devolução e alertas de trânsito.`
  },
  {
    id: 'news-3',
    title: 'E-commerce Brasileiro atinge novo recorde de entregas no mesmo dia (Same Day Delivery)',
    category: 'LOGGI',
    categoryLabel: 'Logística & E-commerce',
    badgeColor: 'emerald',
    readTime: '2 min de leitura',
    publishedAt: 'Hoje às 16:50',
    source: 'Logistics Intelligence BR',
    summary: 'A busca por entregas ultrarrápidas nas capitais cresceu 38% no último trimestre, impulsionada por malhas integradas e mini-hubs urbanos nas principais zonas metropolitanas.',
    keyTakeaway: 'Exigência de baixas de entrega via OCR no mesmo minuto em que o pacote é entregue ao cliente.',
    content: `Os consumidores de grandes centros urbanos estão priorizando marcas que oferecem entregas no mesmo dia até às 22h.
Para suportar esse volume, transportadoras de ponta como a Loggi estão descentralizando estoques através de rotas dedicadas ponto a ponto e confirmação instantânea de canhotos com OCR via aplicativo.`
  },
  {
    id: 'news-4',
    title: 'ANTT e Concessionárias expandem sistema de pedágio eletrônico Free Flow na Rio-SP e Rodoanel',
    category: 'HIGHWAY',
    categoryLabel: 'Rodovias & Trânsito',
    badgeColor: 'amber',
    readTime: '2 min de leitura',
    publishedAt: 'Hoje às 15:30',
    source: 'Boletim Rodovias & Cargas',
    summary: 'Cobrança automática por pórticos elimina paradas em praças de pedágio convencionais, reduzindo o tempo de percurso das carretas de transferência em até 22 minutos.',
    keyTakeaway: 'Maior fluidez na malha rodoviária noturna entre São Paulo e Rio de Janeiro com economia de diesel.',
    content: `A instalação dos pórticos do sistema Free Flow na Rodovia Presidente Dutra e em trechos do Rodoanel Mário Covas já demonstra ganhos expressivos para o transporte rodoviário de cargas.
As carretas não precisam mais desacelerar ou formar filas em praças físicas, o que melhora o cálculo de chegada (ETA) e diminui o risco de paradas em acostamentos.`
  },
  {
    id: 'news-5',
    title: 'Visão Computacional na Borda: Leitura de Danfes e Canhotos elimina extravio de comprovantes',
    category: 'AI',
    categoryLabel: 'Inteligência Artificial',
    badgeColor: 'cyan',
    readTime: '2 min de leitura',
    publishedAt: 'Hoje às 14:10',
    source: 'Tech Logistics News',
    summary: 'Uso de Tesseract OCR e redes neurais no próprio navegador do operador permite validar notas fiscais e comprovantes em menos de 1 segundo sem sobrecarregar servidores centrais.',
    keyTakeaway: 'Auditoria fiscal instantânea e conciliação financeira automatizada para transportadores.',
    content: `O processamento ótico na borda (Edge Computing) chegou em definitivo à logística de distribuição.
Com a leitura instantânea de códigos de barras Danfe e o reconhecimento de assinaturas em comprovantes de entrega, as transportadoras conseguem liquidar faturas de frete no mesmo dia com segurança jurídica e auditoria total.`
  },
  {
    id: 'news-6',
    title: 'Frotas de Vans Elétricas e Telemetria Preditiva avançam 60% na Última Milha urbana',
    category: 'TECH',
    categoryLabel: 'Inovação & Sustentabilidade',
    badgeColor: 'indigo',
    readTime: '3 min de leitura',
    publishedAt: 'Hoje às 11:00',
    source: 'Mobilidade & Futuro',
    summary: 'Adoção em larga escala de veículos 100% elétricos nos polos da Grande São Paulo reduz custos operacionais de manutenção em 40% e zera emissões de carbono na entrega urbana.',
    keyTakeaway: 'Centros urbanos e polos logísticos implementam estações de recarga rápida noturna para vans.',
    content: `As frotas de distribuição urbana da última milha estão migrando rapidamente para veículos elétricos.
Além dos ganhos ambientais e cumprimento de metas ESG, os veículos elétricos possuem custo por quilômetro rodado significativamente menor e alta confiabilidade mecânica durante o tráfego pesado de São Paulo.`
  }
];

export async function weatherAndNewsRoutes(app: FastifyInstance) {
  /**
   * GET /api/weather
   * Fornece previsão meteorológica dinâmica para Cajamar / São Paulo e determina o tema da interface
   */
  app.get('/api/weather', async (_request: FastifyRequest, reply: FastifyReply) => {
    const nowMs = Date.now();
    if (weatherCache && (nowMs - weatherCache.timestamp) < CACHE_TTL_MS) {
      return reply.send({ success: true, cached: true, ...weatherCache.data });
    }

    try {
      // Coordenadas centrais da malha Loggi (Cajamar/SP)
      const lat = -23.3556;
      const lon = -46.8778;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&timezone=America%2FSao_Paulo`;

      const response = await axios.get(url, { timeout: 4000 });
      const current = response.data?.current;

      const temp = current?.temperature_2m ?? 21;
      const apparentTemp = current?.apparent_temperature ?? temp;
      const humidity = current?.relative_humidity_2m ?? 75;
      const isDay = current?.is_day ?? 0;
      const weatherCode = current?.weather_code ?? 0;
      const rain = current?.rain ?? 0;
      const windSpeed = current?.wind_speed_10m ?? 8;

      // Classificação do Clima via WMO code
      let condition: 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog' = 'clear';
      let conditionLabel = 'Céu Limpo';
      let icon = 'sun';
      let wetRoad = false;

      if (weatherCode >= 95) {
        condition = 'storm';
        conditionLabel = 'Tempestade com Raios';
        icon = 'cloud-lightning';
        wetRoad = true;
      } else if (weatherCode >= 51 || rain > 0) {
        condition = 'rain';
        conditionLabel = weatherCode >= 63 ? 'Chuva Forte' : 'Chuva / Pista Molhada';
        icon = 'cloud-rain';
        wetRoad = true;
      } else if (weatherCode >= 45) {
        condition = 'fog';
        conditionLabel = 'Neblina / Baixa Visibilidade';
        icon = 'cloud-fog';
        wetRoad = true;
      } else if (weatherCode >= 1 && weatherCode <= 3) {
        condition = 'cloudy';
        conditionLabel = 'Parcialmente Nublado';
        icon = 'cloud';
      }

      // Determinação do momento do dia
      const now = new Date();
      const hour = now.getHours();
      let timeOfDay: 'morning' | 'day' | 'sunset' | 'night' = 'night';
      if (hour >= 6 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'day';
      else if (hour >= 17 && hour < 19) timeOfDay = 'sunset';
      else timeOfDay = 'night';

      // Recomendação de Tema Adaptativo para a Plataforma
      let recommendedTheme: 'night-rain' | 'night-clear' | 'day-sunny' | 'day-rain' | 'sunset-afternoon' | 'storm' = 'night-clear';

      if (condition === 'storm') {
        recommendedTheme = 'storm';
      } else if (condition === 'rain') {
        recommendedTheme = isDay === 1 ? 'day-rain' : 'night-rain';
      } else if (isDay === 0 || timeOfDay === 'night') {
        recommendedTheme = 'night-clear';
      } else if (timeOfDay === 'sunset') {
        recommendedTheme = 'sunset-afternoon';
      } else {
        recommendedTheme = 'day-sunny';
      }

      const weatherData = {
        city: 'Cajamar / São Paulo (CD Central Loggi)',
        coordinates: { lat, lon },
        temperature: Math.round(temp),
        apparentTemperature: Math.round(apparentTemp),
        humidity,
        windSpeed,
        isDay: isDay === 1,
        timeOfDay,
        weatherCode,
        condition,
        conditionLabel: isDay === 0 && condition === 'clear' ? 'Noite Estrelada' : conditionLabel,
        wetRoadWarning: wetRoad,
        recommendedTheme,
        timestamp: Date.now()
      };

      weatherCache = { data: weatherData, timestamp: nowMs };
      return reply.send({ success: true, ...weatherData });
    } catch (e: any) {
      // Fallback robusto offline baseado no horário do servidor
      const now = new Date();
      const hour = now.getHours();
      const isNight = hour >= 18 || hour < 6;
      const isSunset = hour >= 17 && hour < 18;

      let fallbackTheme: any = 'night-clear';
      let conditionLabel = 'Noite Limpa';
      if (isSunset) {
        fallbackTheme = 'sunset-afternoon';
        conditionLabel = 'Fim de Tarde (Golden Hour)';
      } else if (!isNight) {
        fallbackTheme = 'day-sunny';
        conditionLabel = 'Dia Claro Ensolarado';
      }

      const fallbackData = {
        city: 'Cajamar / São Paulo (CD Central Loggi)',
        temperature: isNight ? 20 : 26,
        apparentTemperature: isNight ? 20 : 27,
        humidity: 78,
        windSpeed: 10,
        isDay: !isNight,
        timeOfDay: isNight ? 'night' : (isSunset ? 'sunset' : 'day'),
        weatherCode: 0,
        condition: 'clear',
        conditionLabel,
        wetRoadWarning: false,
        recommendedTheme: fallbackTheme,
        isFallback: true,
        timestamp: Date.now()
      };

      return reply.send({ success: true, ...fallbackData });
    }
  });

  /**
   * GET /api/news
   * Retorna notícias curadas do mercado de logística, Loggi, IA e inovação
   */
  app.get('/api/news', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as any;
    const category = query?.category?.toUpperCase();
    const search = query?.search?.toLowerCase();

    let articles = [...NEWS_DATABASE];

    if (category && category !== 'ALL') {
      articles = articles.filter(a => a.category === category);
    }

    if (search && search.trim()) {
      const term = search.trim();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(term) ||
        a.summary.toLowerCase().includes(term) ||
        a.content.toLowerCase().includes(term)
      );
    }

    return reply.send({
      success: true,
      count: articles.length,
      categories: [
        { id: 'ALL', label: 'Todas as Notícias' },
        { id: 'LOGGI', label: 'Logística & Loggi' },
        { id: 'AI', label: 'Inteligência Artificial' },
        { id: 'HIGHWAY', label: 'Rodovias & ANTT' },
        { id: 'TECH', label: 'Inovação & Tech' }
      ],
      articles
    });
  });
}
