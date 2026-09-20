# GeoPoder — Alpha 2.0g.2

**Subtítulo interno:** Cúpula Internacional melhorada  
**Regras:** 0.4-C  
**Base:** Alpha 2.0g, derivada da Alpha 2.0e.2

## Objetivo

Esta atualização é voltada à leitura da partida em tempo real. A Mesa de Situação passa a funcionar como quadro principal de acompanhamento quando não é a vez do jogador. O objetivo é que um aluno consiga entender rapidamente quem agiu, contra quem, qual Dossiê foi usado, quais dados foram rolados e quais consequências ocorreram, sem depender do Histórico nem de barras pequenas.

A revisão 2.0g.2 consolida essa arquitetura e corrige o principal gargalo restante da 2.0g.1: todas as opções da Cúpula Internacional permanecem visíveis e acionáveis na área central de Chromebooks e notebooks, sem empurrar “Formar Bloco”, “Acordo” ou “Não realizar ação” para fora da tela.

## 1. Cúpula Internacional melhorada

A Cúpula foi reorganizada em faixas compactas:

- quatro ações principais sempre visíveis: Acordo, Bloco, Troca e Não realizar ação;
- ações de encerramento em uma faixa secundária curta;
- proposta extra do Evento em uma faixa própria;
- indicação explícita do limite de 1 Bloco por país;
- alvos em botões compactos e legíveis;
- efeito da carta oferecida na troca inteiramente visível.

## 2. Mesa Viva

Durante o turno de outro país, a Mesa de Situação deixa de mostrar apenas uma tela de espera. Ela apresenta uma cadeia explícita:

- ator → ação ou Dossiê → alvo → decisão → consequência.

A ação resolvida permanece na área central até ser substituída por um novo acontecimento relevante.

## 3. Dados compartilhados e agrupados

O `dice_display` agora agrega rolagens da mesma fonte na mesma rodada em vez de substituir o resultado anterior. Isso permite:

- Disputa de Influência com os dois dados lado a lado;
- Grande Crise Financeira Global com os dados dos 3 ou 4 países no mesmo quadro;
- rerrolagens substituindo apenas o resultado do país que rerrolou, sem apagar os demais.

Na Grande Crise Financeira, a Mesa também traduz o dado para a consequência econômica correspondente.

## 4. Leitura global da interface

A tipografia foi revista para notebooks, monitores maiores e projeção. Em vez de reduzir continuamente as fontes para fazer o conteúdo caber, a interface reduz elementos secundários primeiro.

Prioridades:

1. regra e consequência mecânica;
2. números e decisões;
3. título e identificação;
4. arte e ambientação;
5. textos editoriais opcionais.

## 5. Escala manual

Em **Como Jogar > Legibilidade da interface**, o jogador pode escolher:

- Compacta;
- Confortável (padrão);
- Grande.

A preferência fica salva no navegador.

## 6. Dossiês sem rolagem na Mesa

O Dossiê aberto usa layout horizontal adaptativo. Conforme o texto cresce:

- a coluna da imagem diminui;
- textos de ambientação podem desaparecer;
- o efeito mecânico permanece visível;
- a área de efeito deixa de usar scroll interno nos estados normais.

Cartas com texto longo recebem automaticamente classes `text-medium` ou `text-heavy`.

## 7. Eventos Globais

O painel Cenário Global também foi reorganizado para priorizar leitura. Eventos de texto longo reduzem a arte e ocultam ambientação antes de reduzir a regra. O efeito principal ganhou fonte maior e o painel evita scroll interno em desktop/Chromebook.

## 8. Agência Internacional

A faixa inferior continua existindo como apoio, mas agora mostra **ação + resultado/consequência**. Propostas, aceitações, recusas, trocas e a decisão de não agir geram boletins completos. A Mesa Viva continua sendo o espaço central.

## 9. Correções do motor

### Proteção Logística

`blockEcoShields` é zerado antes de qualquer transição de rodada, inclusive no encerramento da 8ª rodada, e novamente no início defensivo do próximo Evento. A proteção gerada por **Logística Integrada** não atravessa para a rodada seguinte.

### Relações escolhidas por um mesmo Evento

Eventos como **Guerra Comercial**, **Ruptura das Cadeias Globais** e **Embargo Internacional** não permitem que a mesma relação seja comprometida duas vezes durante a resolução do mesmo Evento. Além de recalcular as opções, o servidor revalida a relação escolhida no momento da resposta.

Não há migration SQL: esse estado vive no JSON autoritativo da partida.

## 10. Compatibilidade e publicação

### Supabase

Substitua a Edge Function por `game-api.ts` e faça Deploy.

### GitHub Pages

Substitua:

- `index.html`
- `app.js`
- `styles.css`
- pasta `assets/`

**Preserve seu `config.js`.** Ele não está incluído no pacote.

Cache-bust de `app.js` e `styles.css`: `20g2`. A referência de `config.js` permanece inalterada em `20g1`, e o arquivo não faz parte do pacote.

## 11. Teste recomendado

1. Abrir Dossiês curtos e longos em 1366×768 e Full HD: confirmar ausência de scroll na Mesa.
2. Observar o turno de outro país: a Mesa deve virar Central de Operações.
3. Jogar **Disputa de Influência**: dois dados devem ficar lado a lado.
4. Resolver **Grande Crise Financeira Global** com 3 ou 4 países: todos os resultados devem permanecer juntos.
5. Usar Vantagem para rerrolar: apenas o dado daquele país deve ser atualizado.
6. Jogar **Logística Integrada**, avançar a rodada e confirmar que a proteção não persiste.
7. Em **Guerra Comercial** ou **Ruptura das Cadeias**, tentar selecionar uma relação já escolhida anteriormente pelo mesmo Evento: ela não deve continuar disponível.
8. Alternar entre escalas Compacta, Confortável e Grande.
9. Testar Cenário Global com Evento de texto longo.
10. Abrir a Cúpula em 1366×768 e confirmar que Acordo, Bloco, Troca e Não realizar ação estão simultaneamente visíveis e clicáveis.
11. Propor, aceitar e recusar Acordos, Blocos e Trocas; confirmar que Mesa e Agência mostram também o resultado.
12. Testar janela secundária e Histórico; scroll continua permitido nessas telas extensas.

## Validação estática executada

- `node --check app.js`: OK.
- `node --experimental-strip-types --check game-api.ts`: OK.
- Regras, 28 Dossiês, 16 Eventos e 12 Desafios comparados com a 2.0g.1: preservados.
- Limite de 1 Bloco por país: preservado no cliente e revalidado no servidor.
- `config.js`: referência preservada e arquivo não incluído.
- 28 Dossiês mantidos.
- 16 Eventos mantidos.
- 5 artes piloto preservadas.
- `config.js` não incluído.
