# GeoPoder — Alpha 2.0c.1

Revisão de estabilidade e telemetria preparada após o primeiro playtest técnico completo da Alpha 2.0c.

## Objetivo desta versão

Esta revisão não altera o balanceamento, as 28 cartas, os 16 Eventos, os Desafios, os países ou as regras 0.3-D. Ela limpa a telemetria e melhora a leitura dos tempos antes do primeiro playtest real com estudantes.

## Correções

### 1. Evita resolução duplicada do Desafio
A última resposta de um jogador não resolve mais o Desafio diretamente. Ela apenas registra a resposta e sincroniza o estado. A transição passa a ser feita exclusivamente pelo relógio autoritativo do professor.

Isso remove a disputa entre a requisição da última resposta e o `tick` do professor, que podia gerar dois `CHALLENGE_RESOLVED` para o mesmo Desafio.

### 2. Impede ticks sobrepostos no navegador do professor
O frontend agora aceita apenas um `tick` em andamento por vez. O intervalo foi reduzido para cerca de 0,9 s para tornar as transições mais responsivas, sem iniciar uma nova chamada antes do término da anterior.

Isso também evita a repetição de efeitos de transição na telemetria, como a compra de renovação registrada duas vezes.

### 3. Tempo de decisão separado do tempo de resolução
Ao confirmar uma Ação Principal, o servidor registra `ACTION_COMMITTED`.

Cada `TURN_FINISHED` passa a guardar:
- `action_choice_time_ms`: tempo desde o início do cronômetro até a Ação Principal ser confirmada;
- `resolution_time_ms`: tempo gasto depois da escolha para resolver alvo, resposta adversária, reação, renovação etc.;
- `turn_total_time_ms`: duração total do turno;
- `decision_time_ms`: mantido por compatibilidade com relatórios anteriores;
- tipo e nome da ação escolhida.

A escolha de uma carta só é considerada confirmada depois que os alvos/modos obrigatórios forem escolhidos.

### 4. Relatório de ritmo
O relatório visual e o Markdown agora incluem:
- média para escolher a Ação Principal;
- média de resolução após a escolha;
- média total do turno;
- quantidade de turnos encerrados por timeout.

## Instalação

Não há migration SQL nova.

### Supabase
Substitua o conteúdo da Edge Function `game-api` pelo arquivo `game-api.ts` desta pasta e faça Deploy.

### GitHub Pages
Substitua no repositório:
- `app.js`
- `index.html`
- `styles.css` (é o mesmo visual da 2.0c, incluído para manter o pacote completo)

Não substitua seu `config.js`.

O `index.html` usa `?v=20c1` nos recursos para forçar os navegadores a buscar a nova versão.

## Versões
- Jogo: Alpha 2.0c.1
- Regras: 0.3-D
