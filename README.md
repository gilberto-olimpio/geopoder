# GeoPoder — Alpha 2.0g.1

**Subtítulo interno:** Mesa Viva, Resolução Compartilhada e Legibilidade  
**Regras:** 0.4-C  
**Base:** Alpha 2.0g, derivada da Alpha 2.0e.2

## Objetivo

Esta atualização é voltada à leitura da partida em tempo real. A Mesa de Situação passa a funcionar como quadro principal de acompanhamento quando não é a vez do jogador. O objetivo é que um aluno consiga entender rapidamente quem agiu, contra quem, qual Dossiê foi usado, quais dados foram rolados e quais consequências ocorreram, sem depender do Histórico nem de barras pequenas.

## 1. Mesa Viva

Durante o turno de outro país, a Mesa de Situação deixa de mostrar apenas uma tela de espera. Ela prioriza:

- governo que está agindo;
- país-alvo;
- Dossiê em resolução;
- decisão pendente;
- consequências já resolvidas;
- último resultado relevante.

A ação resolvida permanece na área central até ser substituída por um novo acontecimento relevante.

## 2. Dados compartilhados e agrupados

O `dice_display` agora agrega rolagens da mesma fonte na mesma rodada em vez de substituir o resultado anterior. Isso permite:

- Disputa de Influência com os dois dados lado a lado;
- Grande Crise Financeira Global com os dados dos 3 ou 4 países no mesmo quadro;
- rerrolagens substituindo apenas o resultado do país que rerrolou, sem apagar os demais.

Na Grande Crise Financeira, a Mesa também traduz o dado para a consequência econômica correspondente.

## 3. Leitura global da interface

A tipografia foi revista para notebooks, monitores maiores e projeção. Em vez de reduzir continuamente as fontes para fazer o conteúdo caber, a interface reduz elementos secundários primeiro.

Prioridades:

1. regra e consequência mecânica;
2. números e decisões;
3. título e identificação;
4. arte e ambientação;
5. textos editoriais opcionais.

## 4. Escala manual

Em **Como Jogar > Legibilidade da interface**, o jogador pode escolher:

- Compacta;
- Confortável (padrão);
- Grande.

A preferência fica salva no navegador.

## 5. Dossiês sem rolagem na Mesa

O Dossiê aberto usa layout horizontal adaptativo. Conforme o texto cresce:

- a coluna da imagem diminui;
- textos de ambientação podem desaparecer;
- o efeito mecânico permanece visível;
- a área de efeito deixa de usar scroll interno nos estados normais.

Cartas com texto longo recebem automaticamente classes `text-medium` ou `text-heavy`.

## 6. Eventos Globais

O painel Cenário Global também foi reorganizado para priorizar leitura. Eventos de texto longo reduzem a arte e ocultam ambientação antes de reduzir a regra. O efeito principal ganhou fonte maior e o painel evita scroll interno em desktop/Chromebook.

## 7. Agência Internacional

A faixa inferior continua existindo como apoio, mas agora mostra **título + resultado** quando houver corpo estruturado no boletim. Ela deixa de ser a fonte principal de compreensão; a Mesa Viva é o espaço central.

## 8. Correções do motor identificadas no teste GEO-F8F7

### Proteção Logística

`blockEcoShields` agora é zerado ao final da rodada. A proteção gerada por **Logística Integrada** não atravessa para a rodada seguinte.

### Relações escolhidas por um mesmo Evento

Eventos como **Guerra Comercial** e **Ruptura das Cadeias Globais** não permitem que a mesma relação seja comprometida duas vezes durante a resolução do mesmo Evento. O servidor mantém `event_relation_claims` temporariamente e recalcula as relações disponíveis antes de cada decisão.

Não há migration SQL: esse estado vive no JSON autoritativo da partida.

## 9. Compatibilidade e publicação

### Supabase

Substitua a Edge Function por `game-api.ts` e faça Deploy.

### GitHub Pages

Substitua:

- `index.html`
- `app.js`
- `styles.css`
- pasta `assets/`

**Preserve seu `config.js`.** Ele não está incluído no pacote.

Cache-bust: `20g1`.

## 10. Teste recomendado

1. Abrir Dossiês curtos e longos em 1366×768 e Full HD: confirmar ausência de scroll na Mesa.
2. Observar o turno de outro país: a Mesa deve virar Central de Operações.
3. Jogar **Disputa de Influência**: dois dados devem ficar lado a lado.
4. Resolver **Grande Crise Financeira Global** com 3 ou 4 países: todos os resultados devem permanecer juntos.
5. Usar Vantagem para rerrolar: apenas o dado daquele país deve ser atualizado.
6. Jogar **Logística Integrada**, avançar a rodada e confirmar que a proteção não persiste.
7. Em **Guerra Comercial** ou **Ruptura das Cadeias**, tentar selecionar uma relação já escolhida anteriormente pelo mesmo Evento: ela não deve continuar disponível.
8. Alternar entre escalas Compacta, Confortável e Grande.
9. Testar Cenário Global com Evento de texto longo.
10. Testar janela secundária e Histórico; scroll continua permitido nessas telas extensas.

## Validação estática executada

- `node --check app.js`: OK.
- TypeScript local: apenas o erro esperado de resolução de `jsr:@supabase/server`, que é fornecido no runtime do Supabase/Deno.
- 28 Dossiês mantidos.
- 16 Eventos mantidos.
- 5 artes piloto preservadas.
- `config.js` não incluído.
