# GeoPoder Alpha 3.0b

## Relações Persistentes

**Regras:** 0.7-DN  
**Base técnica:** Alpha 3.0a  
**Formato:** multiplayer digital para 3 ou 4 equipes reais

Esta versão foi elaborada a partir de duas partidas técnicas da Alpha 3.0a: GEO-YF98 (8 rodadas) e GEO-4B8J (6 rodadas). Elas não foram realizadas com alunos; portanto, os resultados de acerto, tempo e estratégia servem apenas para verificar o sistema, não para tirar conclusões pedagógicas.

## O que foi corrigido

### 1. Efeitos das escolhas de Evento

O relatório da GEO-4B8J mostrou que todos escolheram perder Economia no Embargo Internacional, mas a perda não ocorreu. A causa estava na fila de resolução: a consequência era colocada depois do encerramento do Evento e não chegava a ser executada.

As consequências escolhidas agora entram imediatamente na fila, antes do encerramento. A correção vale para perdas, ganhos, renovação e alterações de relações produzidas por Eventos.

### 2. Relações persistentes

Tensão, Suspensão e Crise não desaparecem automaticamente na rodada seguinte. Elas desativam os benefícios da relação até que um dos parceiros use sua iniciativa na Cúpula para repará-la.

Se a mesma relação sofrer um segundo abalo antes do reparo, ela é dissolvida. A mudança passa a ser registrada como estado persistente, reparo ou dissolução na telemetria e nos boletins públicos.

### 3. Cúpula em ordem de iniciativa

As iniciativas diplomáticas deixam de acontecer ao mesmo tempo. Cada país age na ordem dos turnos nacionais; os demais acompanham ou respondem a propostas sem gastar sua própria iniciativa.

A interface informa quem está em foco, quem já concluiu e quem ainda aguarda. Reparar uma relação consome a iniciativa diplomática do país.

### 4. Dossiê sem alvo válido

Quando nenhum Dossiê da mão possui alvo válido, o jogador pode substituir um deles: descarta 1, compra 1 e encerra a Ação Principal. A opção só aparece quando realmente não há carta principal utilizável.

O relatório distingue agora:

- turnos iniciados sem Dossiê utilizável;
- substituições realizadas;
- passes voluntários e passes por falta de opção.

### 5. Telas baixas e Modo Projetor

As áreas de descarte e de Desafio ganharam rolagem interna para que os botões permaneçam acessíveis. O painel público foi reorganizado para caber na altura disponível e manter Relações Internacionais e Últimos Boletins visíveis em áreas roláveis.

## O que foi preservado

- modos Completa (8 rodadas) e Sala de aula (6 rodadas);
- modelos Digital 0.6 e Comparação 0.4-C;
- 12 Desafios Geográficos e seus gabaritos;
- cartas, Eventos, países e cinco artes piloto;
- Modo Projetor e exportação Markdown, CSV e JSON;
- banco de dados atual, sem nova migration SQL.

## Publicação

### 1. Supabase

Substitua a Edge Function atual por `game-api.ts` e faça o deploy primeiro.

### 2. GitHub Pages

Depois substitua:

- `index.html`;
- `app.js`;
- `styles.css`;
- pasta `assets/`.

Preserve seu `config.js`; ele não está incluído no pacote.

Não há migration SQL. Inicie uma sala nova para testar a 3.0b; partidas antigas preservam o estado e a versão em que foram criadas.

## Teste dirigido recomendado

1. Iniciar uma partida curta com três países e confirmar o Evento da rodada 1.
2. Em um Evento com escolha de perda, escolher a perda e conferir atributo, boletim e telemetria.
3. Criar um Acordo, aplicar Tensão ou Suspensão e avançar a rodada: o estado deve permanecer.
4. Reparar a relação na Cúpula e confirmar que a iniciativa foi consumida.
5. Aplicar dois abalos antes do reparo e confirmar a dissolução da relação.
6. Na Cúpula, confirmar que somente o país em foco consegue iniciar uma ação.
7. Dar a um país apenas Dossiês sem alvo e confirmar a opção de substituição.
8. Testar descarte e Desafio em tela de notebook baixa.
9. Abrir o Modo Projetor e verificar Relações e Boletins sem sair da tela.
10. Exportar o relatório e conferir os novos indicadores e eventos de reparo.

## Arquivos

- `index.html` — entrada e cache-bust `30b`;
- `app.js` — interface, relatório e fluxo sequencial da Cúpula;
- `styles.css` — correções para telas baixas e projeção;
- `game-api.ts` — motor autoritativo e telemetria;
- `ANALISE_DOS_TESTES.md` — comparação das duas partidas que orientaram a versão;
- `assets/cards/` — cinco artes piloto preservadas;
- `tests/static-regression.mjs` — verificações estruturais do pacote;
- `tests/ui-smoke.mjs` — verificação visual automatizada quando o navegador está disponível.
