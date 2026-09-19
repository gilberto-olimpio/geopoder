# GeoPoder — Alpha 2.0g

**Subtítulo interno:** Comunicação, Acessibilidade e Clareza Pedagógica  
**Regras:** 0.4-C  
**Base:** Alpha 2.0e.2 (interface otimizada + motor 0.4-C)

## Objetivo desta atualização

A 2.0g nasce do playtest real GEO-MLVR, em que a partida começou na 2.0e.1 e foi concluída após downgrade para uma interface equivalente à 2.0f. O foco desta versão não é acrescentar novas mecânicas, mas tornar visível o que já acontece no jogo: quem agiu, quem foi alvo, quais efeitos ocorreram e o que cada tipo de carta representa.

## 1. Mesa de Situação — ações compartilhadas

A Mesa de Situação agora possui um **Ação em Evidência** compartilhado por todos os clientes. Quando um governo executa um Dossiê, a tela informa:

- país que tomou a decisão;
- Dossiê utilizado;
- país-alvo, quando existir;
- consequências de atributos e estados diplomáticos à medida que são resolvidas.

O Histórico continua existindo, mas deixa de ser o único lugar para descobrir o que aconteceu.

## 2. Alertas para o país afetado

Foi criado um feed visual inspirado em boletins/notícias curtas. Quando um país sofre perda direta causada por outro governo, recebe um cartão em evidência com:

- **ISTO AFETOU SEU PAÍS**;
- atacante;
- origem da ação;
- alteração de atributo antes → depois.

Reações também geram um alerta próprio. O sistema usa a linguagem visual da Sala de Comando, sem depender de uma rede social real.

## 3. Agência Internacional

As últimas ações públicas aparecem em uma faixa compacta na parte inferior da Sala de Comando. Isso ajuda jogadores que não são o alvo a acompanhar a partida sem abrir o Histórico.

## 4. Tutorial refeito

O onboarding agora começa pelo objetivo da partida:

> terminar a 8ª rodada com a maior Influência.

Ele explica explicitamente que:

- Influência = Economia + Redes + Diplomacia + Cultura;
- todos os quatro atributos em pelo menos 2 ao final concedem +2 de Potência Equilibrada;
- no turno, o jogador examina Dossiês e realiza uma Ação Principal;
- Reações não são Ações Principais;
- Eventos devem ser lidos antes da decisão;
- ações dos demais governos devem ser acompanhadas na Mesa de Situação.

A seção **Como Jogar** foi atualizada com a mesma lógica.

## 5. Tipos de carta e acessibilidade

Os Dossiês não são diferenciados apenas por cor. Cada família combina **cor + ícone + padrão de borda + texto explícito**:

- **Desenvolvimento:** borda contínua + símbolo ▣;
- **Interferência:** borda tracejada + símbolo de alvo;
- **Reação:** borda dupla + símbolo de escudo e faixa “REAÇÃO”;
- **Risco / Escolha:** borda pontilhada + símbolo ◆.

Isso melhora a distinção para jogadores com daltonismo e também para projeção ou telas com qualidade de cor limitada.

## 6. Legibilidade

- textos da mão foram ampliados;
- o Dossiê aberto na Mesa usa fonte maior para efeito mecânico;
- o efeito do Evento Global recebeu prioridade e tamanho maior;
- em telas baixas, elementos decorativos encolhem antes da regra;
- a arte continua subordinada à leitura mecânica.

## 7. Rolagens de dados

Rolagens continuam usando o `dice_display` autoritativo do servidor e agora também entram no fluxo público de acontecimentos. Assim, resultados de cartas e disputas aparecem para os participantes ao mesmo tempo e permanecem registrados no feed recente.

## 8. Troca de cartas

A Cúpula mostra o **efeito completo da carta que o proponente está oferecendo** antes de enviar a proposta. O receptor recebe a carta em formato de Dossiê completo antes de aceitar ou recusar. O objetivo é testar novamente a mecânica antes de alterar seu balanceamento.

## 9. Correções de integridade do motor

### Máximo de um Bloco por país

O servidor agora considera também um Bloco temporariamente inativo/suspenso ao verificar o limite. Há uma segunda validação defensiva no momento de formar o Bloco. Um país não pode terminar com dois Blocos ativos por causa de uma condição intermediária de estado.

### Pressão Geopolítica

A 2.0g preserva a regra 0.4-C: **Pressão Geopolítica não encerra Acordos**. O alvo escolhe entre perda de Diplomacia, descarte aleatório ou colocar o Acordo com o atacante sob Tensão, quando essa opção for válida.

## 10. Telemetria de versão

Novos eventos de telemetria incluem:

- `game_version`;
- `rules_version`;
- `client_version`.

O frontend envia sua versão ao backend em cada chamada. Isso torna futuros relatórios mais úteis quando houver troca de versão durante uma sessão.

## 11. Feed estruturado no estado público

O estado autoritativo passou a publicar:

- `bulletins`: últimos acontecimentos estruturados;
- `action_spotlight`: ação atualmente destacada;
- `dice_display`: rolagem autoritativa já existente.

Não há migration SQL: os campos vivem no JSON do estado da partida.

## Artes

Permanece a estratégia híbrida da 2.0e:

- #04 Investimento Produtivo;
- #06 Fórum Econômico Regional;
- #12 Fuga de Capitais;
- #13 Guerra de Narrativas;
- #27 Abertura Comercial.

As outras cartas usam placeholder e identidade de categoria até a produção das artes definitivas.

## Publicação

### Supabase

Substitua a Edge Function pelo `game-api.ts` desta pasta e faça **Deploy**.

Não há migration SQL nova.

### GitHub Pages

Substitua:

- `index.html`
- `app.js`
- `styles.css`
- pasta `assets/`

**Preserve seu `config.js` atual.** O arquivo não está no pacote para evitar sobrescrever as chaves públicas já configuradas.

Cache-bust: `20g`.

## Validação local executada

- `node --check app.js`: OK.
- TypeScript: sem erro local além da resolução esperada de `jsr:@supabase/server`, indisponível no `tsc` local.
- 5 assets piloto presentes.
- 28 Dossiês e 16 Eventos mantidos.
- regra 0.4-C preservada.

## Playtest recomendado para a 2.0g

1. Um jogador usa Interferência contra outro: confirmar se **todos** veem ator, carta e alvo.
2. Confirmar se o alvo recebe **ISTO AFETOU SEU PAÍS** com a alteração numérica correta.
3. Usar uma Reação e verificar distinção visual + alerta.
4. Testar cartas de cada família sem depender apenas de cor.
5. Ler cartas e Eventos em Chromebook sem zoom.
6. Fazer uma troca de cartas e verificar se ambos entendem o que estão oferecendo/recebendo.
7. Jogar Disputa de Influência e Grande Crise Financeira: confirmar dados simultâneos.
8. Tentar formar um segundo Bloco com país que já possui Bloco: o servidor deve impedir.
9. Usar Pressão Geopolítica contra parceiro de Acordo: o motor não deve encerrar o Acordo.
10. Exportar o relatório e confirmar `game_version`, `rules_version` e `client_version` na telemetria nova.
