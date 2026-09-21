# GeoPoder Alpha 3.0c

## Integridade de Versão

**Regras:** 0.7-DN  
**Base técnica:** Alpha 3.0b  
**Formato:** multiplayer digital para 3 ou 4 equipes reais

Esta versão foi organizada a partir da comparação das sessões técnicas GEO-FN3V e GEO-SWNS. Nenhuma delas foi realizada com alunos; seus dados servem para validar o sistema, não para concluir algo sobre aprendizagem ou dificuldade.

## O que mudou

### 1. Bloqueio de cliente desatualizado

O servidor recusa ações de qualquer cliente cuja versão seja diferente da versão publicada. A tela informa que a atualização é obrigatória e oferece um botão para recarregar. A ação antiga não altera o estado da partida.

Consultas de painel, histórico e snapshot permanecem disponíveis para diagnóstico, mas criar, entrar, jogar ou comandar a partida exige a 3.0c.

### 2. Integridade de versão no relatório

O painel da partida e o relatório Markdown mostram as versões realmente observadas nas ações de cada país. Se algum aparelho agir com uma versão diferente da versão da partida, o relatório exibe um alerta explícito.

### 3. Grande Crise Financeira Global

A perda de Economia resultante do dado agora entra antes do encerramento do Evento:

- resultado 1–2: perde 2 de Economia;
- resultado 3–4: perde 1 de Economia;
- resultado 5–6: sem perda.

A correção cobre tanto a aceitação do dado inicial quanto a rerrolagem com Vantagem.

### 4. Diagnóstico de respostas rejeitadas

Quando uma resposta a uma decisão pendente falhar, a telemetria registra `PENDING_RESPONSE_REJECTED`, incluindo o tipo da decisão e a mensagem técnica. Isso permitirá investigar uma nova ocorrência como a primeira tentativa da Cláusula de Salvaguarda na GEO-SWNS.

## O que foi preservado

- regras 0.7-DN e balanceamento da Alpha 3.0b;
- relações persistentes, reparo e dissolução após segundo abalo;
- Cúpula sequencial na ordem dos turnos;
- substituição de Dossiê quando a mão não possui ação utilizável;
- modos Completa (8 rodadas) e Sala de aula (6 rodadas);
- modelos Digital 0.6 e Comparação 0.4-C;
- cartas, Eventos, Desafios e cinco artes piloto;
- Modo Projetor e exportação Markdown, CSV e JSON;
- banco de dados atual, sem nova migration SQL.

## Publicação

### 1. Supabase

Substitua a Edge Function atual por `game-api.ts` e faça o deploy primeiro.

### 2. Site

Depois substitua:

- `index.html`;
- `app.js`;
- `styles.css`;
- pasta `assets/`.

Preserve seu `config.js`; ele não está incluído no pacote.

Não há migration SQL. Crie uma sala nova depois da publicação. Ao abrir a nova versão em cada aparelho, faça uma atualização forçada da página antes de entrar na sala.

## Teste dirigido recomendado

1. Tentar uma ação com uma aba 3.0b e confirmar que o servidor a recusa sem alterar a partida.
2. Atualizar a aba, entrar novamente e confirmar a identificação 3.0c no relatório.
3. Forçar a Grande Crise Financeira Global e validar as três faixas do dado.
4. Repetir a resolução usando Vantagem para rerrolar.
5. Usar a Cláusula de Salvaguarda contra Tensão, Suspensão ou Crise.
6. Exportar o relatório e conferir a seção “Integridade de versão”.

## Arquivos

- `index.html` — entrada e cache-bust `30c`;
- `app.js` — interface, bloqueio visual e relatório de integridade;
- `styles.css` — interface e enquadramento responsivo preservados;
- `game-api.ts` — motor autoritativo, bloqueio de versão e telemetria;
- `ANALISE_DOS_TESTES.md` — comparação GEO-FN3V × GEO-SWNS;
- `assets/cards/` — cinco artes piloto preservadas;
- `tests/static-regression.mjs` — verificações estruturais do pacote;
- `tests/ui-smoke.mjs` — verificação visual automatizada quando o navegador está disponível.
