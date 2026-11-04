# 🚀 Unified WhatsApp Enterprise Gateway

Gateway corporativo de alta concorrência e baixa latência para integração de WhatsApp Web Multi-Device sem dependência de navegadores gráficos (Puppeteer/Chromium), construído com **Node.js, TypeScript, Fastify e Baileys Engine**.

Projetado especificamente para:
- 👥 Múltiplas sessões simultâneas isoladas (Multi-Tenancy).
- 💬 Atendimento Humano via **Chatwoot**.
- 🤖 Fluxos Interativos com **Typebot**.
- 🧠 Agentes Autônomos de Inteligência Artificial com protocolo **Human-in-the-Loop**.
- 🎙️ Transcodificação automática de mensagens de voz PTT (Opus/OGG) com waveform nativo via **FFmpeg**.

---

## 🏛️ 1. Arquitetura em Camadas (Hexagonal / Clean Architecture)

```
src/
├── domain/                      # Regras de Negócio e Contratos de Dados
│   ├── session.ts               # Entidade de Sessão WhatsApp
│   ├── message.ts               # Mensagem Normalizada & DTO de Envio
│   └── webhook.ts               # Contratos de Eventos
├── infrastructure/              # Adaptadores de Tecnologia e I/O
│   ├── whatsapp/
│   │   ├── baileysEngine.ts     # Core WebSocket Baileys sem navegador
│   │   └── mediaHandler.ts      # Pipeline de Mídia e Conversão FFmpeg
│   ├── queue/
│   │   └── eventBus.ts          # Barramento de Eventos Desacoplado
│   └── connectors/
│       ├── chatwootConnector.ts # Sincronização com Chatwoot
│       ├── typebotConnector.ts  # Orquestrador de fluxos Typebot
│       └── aiAgentConnector.ts  # Roteador IA com Pausa Humana
├── application/                 # Casos de Uso
│   ├── sessionService.ts        # Gerenciamento de Ciclo de Vida
│   ├── messageService.ts        # Envio Idempotente de Mensagens
│   └── webhookDispatcher.ts     # Despacho Assíncrono de Webhooks
└── presentation/                # Camada HTTP / REST
    ├── routes/
    │   ├── sessionRoutes.ts     # /sessions: start, status, delete
    │   ├── messageRoutes.ts     # /messages: send (texto, voz, mídia)
    │   └── healthRoutes.ts      # /health: liveness, métricas
    └── middlewares/
        └── authMiddleware.ts    # Bearer Token API Key Protection
```

---

## ⚡ 2. Especificação da API REST

Acesse a documentação Swagger OpenAPI interativa em:  
`http://localhost:8080/documentation`

Todas as rotas (exceto `/health` e `/documentation`) exigem o header de autenticação:
```http
Authorization: Bearer sua_chave_mestra_secreta_aqui
```

### Principais Endpoints

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/sessions/:sessionId/start` | Inicializa ou restaura a sessão e gera QR Code se necessário. |
| `GET` | `/sessions/:sessionId/status` | Retorna o status da conexão (`CONNECTING`, `SCAN_QR_CODE`, `CONNECTED`) e o QR Code em Base64. |
| `GET` | `/sessions` | Lista todas as sessões ativas e métricas de conexão. |
| `DELETE` | `/sessions/:sessionId` | Desconecta a sessão e limpa os arquivos de autenticação. |
| `POST` | `/messages/:sessionId/send` | Envia mensagem de texto, áudio de voz PTT ou mídias. |
| `GET` | `/health` | Métricas de liveness, uso de memória RSS e sessões ativas. |

---

## 🛠️ 3. Exemplos Práticos de Uso (cURL)

### 3.1 Iniciar Sessão e Obter QR Code
```bash
# 1. Inicia a sessão "comercial_01"
curl -X POST http://localhost:8080/sessions/comercial_01/start \
  -H "Authorization: Bearer sua_chave_mestra_secreta_aqui"

# 2. Consulta o status e obtém o QR Code em Base64 para exibir no seu frontend
curl -X GET http://localhost:8080/sessions/comercial_01/status \
  -H "Authorization: Bearer sua_chave_mestra_secreta_aqui"
```

### 3.2 Enviar Mensagem de Texto
```bash
curl -X POST http://localhost:8080/messages/comercial_01/send \
  -H "Authorization: Bearer sua_chave_mestra_secreta_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999998888",
    "text": "Olá! Sua solicitação foi recebida com sucesso."
  }'
```

### 3.3 Enviar Áudio de Voz Nativo (PTT com Waveform)
```bash
curl -X POST http://localhost:8080/messages/comercial_01/send \
  -H "Authorization: Bearer sua_chave_mestra_secreta_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999998888",
    "mediaType": "voice",
    "mediaUrl": "https://meuservidor.com/audios/resposta.ogg"
  }'
```

---

## 🐳 4. Como Executar

### Em Desenvolvimento Local
```bash
npm install
npm run dev
```

### Em Produção com Docker Compose
```bash
docker compose up -d --build
```
O container iniciará com reinício automático (`restart: unless-stopped`), limite de memória parametrizado e FFmpeg integrado.
