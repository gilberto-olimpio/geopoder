# GeoPoder Alpha 3.0a

## Fundação Digital Native

**Regras:** 0.6-DN  
**Base técnica:** Alpha 2.0g.2d  
**Formato:** multiplayer digital para 3 ou 4 equipes reais

Esta versão inicia a transição do GeoPoder para um jogo concebido diretamente para o ambiente digital. O motor continua responsável pelas regras, validações e transições; a interface mostra decisões concretas e suas consequências. As correções de legibilidade, Cúpula, rolagens, Reações, reconexão e telemetria da Alpha 2.0g.2d foram preservadas.

## O que mudou

### 1. Dois formatos de partida

O professor escolhe a configuração no lobby antes de iniciar:

- **Completa:** 8 rodadas e 4 Desafios Geográficos;
- **Sala de aula:** 6 rodadas e 3 Desafios Geográficos.

O modo escolhido é salvo no estado da partida e na telemetria. A interface, o encerramento do motor e o relatório usam o número configurado de rodadas.

### 2. Modelo inicial Digital 0.6

O modelo padrão passa de `3–2–2–0` para `3–2–1–1`. Cada país mantém sete pontos, um atributo forte e fragilidades reconhecíveis, mas nenhuma equipe começa obrigada a gastar a primeira Ação Principal em Recuperação Nacional.

O professor pode selecionar **Comparação 0.4-C · 3–2–2–0**. Essa opção existe para comparar partidas e verificar, pela telemetria, se o novo modelo realmente reduz aberturas automáticas.

### 3. Desafios ligados à partida

Os Desafios das rodadas pares agora são escolhidos considerando:

- o Evento Global vigente;
- a existência de Acordos ou Blocos;
- os Desafios já usados na sessão.

A tela apresenta um pequeno texto de contexto antes da questão. O relatório registra o gatilho usado para selecionar o Desafio. As 12 questões e seus gabaritos foram preservados.

### 4. Cúpula com leitura contextual

Antes de concluir a iniciativa, o gabinete recebe uma leitura curta sobre oportunidades observáveis:

- quantos Dossiês da mão podem se beneficiar de Acordo;
- quantos dependem de Bloco;
- quando a Troca pode ser útil;
- quando não existe oportunidade diplomática evidente e passar é uma decisão válida.

O motor também registra, no início da Cúpula e em cada iniciativa, quais alvos diplomáticos estavam disponíveis. Isso permite distinguir falta de opções de falta de interesse.

### 5. Modo Projetor

O painel do professor ganhou **Modo Projetor**. Ele mostra apenas dados públicos:

- rodada, fase e Evento Global;
- atributos e Influência dos países;
- relações internacionais;
- progresso do Desafio ou da Cúpula;
- últimos boletins públicos.

Nenhuma mão, Dossiê privado ou decisão secreta é exibida.

### 6. Relatório de experimento

O relatório docente e a exportação Markdown agora destacam:

- modo e quantidade de rodadas;
- modelo inicial utilizado;
- número de Recuperações Nacionais;
- turnos passados sem Dossiê;
- Cúpulas em que não houve proposta;
- mediana do tempo de resposta aos Desafios;
- indicadores anteriores de cartas, ritmo e diplomacia.

## O que não entrou nesta versão

- bots ou países controlados pelo computador;
- novos países, cartas, Eventos ou artes;
- modo individual;
- alteração de banco de dados;
- migração integral dos estados diplomáticos persistentes das Regras 0.5-A.

Os países não ocupados continuam fora da sessão. A prioridade desta versão é testar a fundação Digital Native com equipes reais antes de ampliar o conteúdo ou automatizar jogadores.

## Publicação

### Supabase

Substitua a Edge Function atual por `game-api.ts` e faça o deploy.

### GitHub Pages

Substitua:

- `index.html`;
- `app.js`;
- `styles.css`;
- pasta `assets/`.

Preserve seu `config.js`. Ele não está incluído no pacote.

Não há migration SQL nesta atualização. As novas configurações vivem no JSON autoritativo da partida e na telemetria já existente.

## Teste dirigido recomendado

1. Criar uma sala completa com o modelo Digital 0.6 e confirmar atributos `3–2–1–1`.
2. Criar uma sala curta e confirmar encerramento após a 6ª rodada.
3. Criar uma sala de comparação e confirmar atributos `3–2–2–0`.
4. Em rodada par, verificar se o Desafio mostra contexto relacionado ao Evento.
5. Abrir a Cúpula com Dossiês de Acordo ou Bloco na mão e verificar a leitura do conselho.
6. Passar na Cúpula e conferir no relatório se a iniciativa e as oportunidades foram registradas.
7. Ativar o Modo Projetor e confirmar que nenhuma mão privada aparece.
8. Manter o Modo Projetor aberto durante troca de fase e confirmar atualização automática.
9. Exportar Markdown, CSV e JSON e conferir a configuração da partida.
10. Repetir os testes críticos da 2.0g.2d: Disputa de Influência, Grande Crise Financeira, Reações, Renovação, Cúpula e Gabinete em telas baixas.

## Arquivos

- `index.html` — entrada e cache-bust `30a`;
- `app.js` — interface, Modo Projetor e relatório;
- `styles.css` — estilos da configuração, contexto e projeção;
- `game-api.ts` — motor autoritativo e telemetria;
- `assets/cards/` — cinco artes piloto preservadas;
- `tests/static-regression.mjs` — verificações estruturais do pacote.
