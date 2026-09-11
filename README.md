# GeoPoder — Alpha 2.0a (Supabase Multiplayer)

Este pacote é a **primeira entrega da Alpha 2**. Ele migra o GeoPoder de um jogo local para uma arquitetura multiplayer com **4 equipes obrigatórias**, cada uma em seu próprio aparelho, e inicia a coleta de telemetria de playtest.

## O que já funciona nesta etapa

- criação de sala pelo professor;
- código curto de sala (`GEO-XXXX`);
- entrada de exatamente quatro equipes;
- assentos fixos: Aurora, Montária, Pacífica e Solária;
- nome de equipe associado ao país;
- autenticação anônima do Supabase para cada aparelho;
- reconexão no mesmo aparelho após recarregar a página;
- estado público sincronizado por Supabase Realtime;
- mãos privadas: cada jogador recebe somente a própria mão; o professor pode ver todas;
- inicialização do baralho, mãos, ordem de turno, 8 Eventos e 4 Desafios no servidor;
- banco preparado para estado autoritativo do servidor;
- telemetria desde a criação da sala;
- painel do professor com exportação em **Markdown, CSV e JSON**;
- campo de notas do professor integrado à telemetria.

## O que entra na etapa Alpha 2.0b

- migração do motor completo de cartas para a Edge Function;
- Eventos e escolhas simultâneas;
- Desafios Geográficos simultâneos;
- cronômetros do servidor;
- dados globais;
- Reações;
- Diplomacia entre aparelhos;
- Acordos Comerciais e Blocos;
- perdas redirecionadas quando atributo = 0;
- log curto de resultado em cada tela;
- telemetria detalhada de cartas jogadas/descartadas, questões, acertos, tempo de resposta, dados, negociações e atributos.

---

# Instalação no Supabase

## 1. Ative login anônimo

No Dashboard do Supabase, habilite **Anonymous Sign-Ins** em Authentication.

Os jogadores não precisam criar conta: cada aparelho recebe uma identidade temporária persistida no navegador.

## 2. Crie o banco

Abra **SQL Editor** e execute:

`supabase/migrations/001_geopoder_alpha2.sql`

Ele cria:

- `gp_rooms`
- `gp_room_players`
- `gp_matches`
- `gp_player_private_state`
- `gp_server_match_state`
- `gp_telemetry_events`

Também cria RLS, funções auxiliares de autorização e adiciona as tabelas necessárias ao Realtime.

## 3. Crie a Edge Function `game-api`

No Dashboard, vá a **Edge Functions** e crie uma função chamada:

`game-api`

Cole o conteúdo de:

`supabase/functions/game-api/index.ts`

A função deve exigir JWT. O arquivo `supabase/config.toml` já contém a configuração equivalente para uso pela CLI.

### Se usar CLI

Na raiz deste pacote:

```bash
supabase functions deploy game-api
```

Não coloque secret key no frontend. A Edge Function usa as chaves secretas do próprio ambiente Supabase.

## 4. Configure o frontend

No diretório `web/`, edite `config.js`:

```js
window.GEOPOWER_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_...'
};
```

Use a **publishable key**, não a secret key.

## 5. Publique o diretório `web/`

Pode ser hospedado em qualquer serviço de arquivos estáticos, por exemplo GitHub Pages, Netlify ou Vercel.

Para teste local, use um servidor HTTP simples. Exemplo com Python:

```bash
cd web
python -m http.server 8080
```

Abra:

`http://localhost:8080`

---

# Teste mínimo da Alpha 2.0a

1. Abra o jogo em um aparelho do professor.
2. Crie uma sala e anote o código.
3. Abra o mesmo endereço em quatro navegadores/aparelhos diferentes.
4. Em cada um, use o código e ocupe um país diferente.
5. O professor deve ver as quatro equipes aparecerem quase imediatamente.
6. Clique em **Iniciar partida**.
7. Cada jogador deve ver:
   - os atributos públicos dos quatro países;
   - somente a própria mão;
   - o país ativo e a fase atual.
8. O professor deve ver a telemetria e poder exportar o relatório.
9. Atualize a página de um jogador. Ele deve voltar à mesma sala e manter seu país/mão.

---

# Telemetria planejada

A tabela `gp_telemetry_events` usa um formato de eventos. Isso permite ampliar relatórios sem redesenhar o banco.

Exemplos futuros:

- `QUESTION_ANSWERED`
- `CARD_DRAWN`
- `CARD_PLAYED`
- `CARD_DISCARDED`
- `CARD_TRADED`
- `CARD_RENEWED`
- `CARD_NO_VALID_TARGET`
- `ATTRIBUTE_CHANGED`
- `DIE_ROLLED`
- `ADVANTAGE_USED`
- `AGREEMENT_PROPOSED`
- `AGREEMENT_ACCEPTED`
- `AGREEMENT_REJECTED`
- `BLOCK_FORMED`
- `BLOCK_BROKEN`
- `REACTION_USED`
- `TURN_STARTED`
- `FIRST_INTERACTION`
- `TURN_FINISHED`
- `TURN_EXPIRED`
- `MATCH_FINISHED`
- `PLAYER_FEEDBACK`

O relatório Markdown foi pensado para ser enviado diretamente ao ChatGPT durante os playtests.

---

# Segurança

- O navegador usa apenas a **publishable key**.
- Nenhum navegador recebe `gp_server_match_state`.
- Jogadores não possuem permissão de escrita direta nas tabelas do jogo.
- Mudanças passam pela Edge Function.
- RLS limita a leitura da mão privada ao próprio jogador e ao professor.
- A telemetria completa fica visível apenas para o professor da sala.

## Estrutura do pacote

```text
geopoder_alpha2_supabase/
├── README.md
├── web/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── config.js
│   └── config.example.js
└── supabase/
    ├── config.toml
    ├── migrations/
    │   └── 001_geopoder_alpha2.sql
    └── functions/
        └── game-api/
            └── index.ts
```
