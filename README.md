# GeoPoder — Alpha 2.0d “Sala de Comando”

Versão preparada a partir do primeiro playtest real com estudantes da Alpha 2.0c.1.

## Versões

- Jogo: **Alpha 2.0d**
- Regras: **0.4-A**
- 3 ou 4 equipes
- Baralho de 28 cartas preservado
- 8 rodadas preservadas

## Principais mudanças

### 1. Sala de Comando sem rolagem da página
Durante a partida, a tela principal ocupa a área inteira do navegador e mantém simultaneamente:

- painel do próprio país e seus quatro atributos;
- Influência e Vantagens;
- Mesa de Situação, mostrando a fase e a ação em andamento;
- Evento Global da rodada em grande destaque;
- mão do jogador permanentemente visível na parte inferior.

Informações secundárias foram movidas para janelas abertas pelos botões **Situação mundial**, **Diplomacia**, **Histórico** e **Regras**.

Em telas estreitas (celulares), o layout se reorganiza verticalmente. O layout sem rolagem foi projetado principalmente para computadores e Chromebooks de sala.

### 2. Evento Global permanente
A carta de Evento não desaparece durante os turnos. Nome, tipo e efeito permanecem em evidência durante toda a rodada.

### 3. Fim do cronômetro automático
Não existe mais limite automático de 45 segundos e não existe mais “+30 s”.

A equipe ainda confirma **Estamos prontos — iniciar turno**. Depois disso, joga sem relógio visível. Se necessário, o professor usa **Encerrar turno**.

Eventos, decisões e Desafios também não expiram automaticamente. O painel do professor possui controles para resolver uma decisão parada, resolver o Desafio e prosseguir para a fase seguinte.

### 4. Nova Cúpula Diplomática
Diplomacia deixou de consumir a Ação Principal do país.

Ao fim dos turnos nacionais de cada rodada, abre-se a **Cúpula Diplomática**. Cada país dispõe de **1 iniciativa diplomática por rodada** para:

- propor um Acordo;
- propor/formar um Bloco;
- trocar 1 carta por 1;
- encerrar um Acordo;
- sair de um Bloco (mantido o custo de -1 Diplomacia);
- passar sem fazer proposta.

Aceitar ou recusar uma proposta recebida **não consome** a iniciativa diplomática do receptor.

O professor encerra a Cúpula quando considerar adequado. Países impedidos de usar Diplomacia por um Evento entram automaticamente como “concluídos” naquela Cúpula.

As 28 cartas não foram rebalanceadas nesta versão. A intenção é testar primeiro se retirar o custo de oportunidade da Diplomacia torna Acordos e Blocos mais atraentes.

### 5. Controle docente
Durante uma partida, o professor pode:

- iniciar um turno antes da confirmação da equipe;
- encerrar manualmente o turno atual;
- resolver uma decisão pendente por uma opção padrão de segurança;
- resolver o Desafio, inclusive antes de todas as respostas (as ausentes contam como erro);
- liberar a fase após mostrar o resultado do Desafio;
- encerrar a Cúpula Diplomática;
- interromper a sessão;
- registrar notas e exportar relatórios.

### 6. Menos concorrência no motor
O `tick` automático foi desativado. Transições importantes agora dependem de ações explícitas do jogador ou do professor. Isso elimina a principal origem das duplicações vistas no relatório da Alpha 2.0c.1.

A Cúpula usa também uma trava otimista ao receber iniciativas diplomáticas. Caso dois países enviem propostas praticamente no mesmo instante, uma é processada e a outra recebe uma mensagem para tentar novamente, em vez de sobrescrever o estado.

### 7. Telemetria de Diplomacia
Os novos relatórios registram:

- `DIPLOMACY_PHASE_STARTED`;
- `DIPLOMACY_INITIATIVE`;
- `DIPLOMACY_PHASE_ENDED`;
- propostas/respostas de Acordos e Blocos;
- trocas;
- relações encerradas.

O relatório Markdown e o painel de histórico ganham uma seção resumida de Diplomacia.

## Atualização

### Supabase
Substitua o código da Edge Function `game-api` por `game-api.ts` e faça **Deploy**.

**Não há migration SQL nova.**

### GitHub Pages
Substitua:

- `index.html`
- `app.js`
- `styles.css`

Mantenha o seu `config.js` atual.

O `index.html` usa `?v=20d`, forçando os navegadores a buscar os novos arquivos.

## Roteiro mínimo de teste antes da próxima aula

1. Criar uma sala com 3 ou 4 países.
2. Confirmar que a tela de partida ocupa o navegador e que atributos, Evento e mão estão visíveis sem rolar a página.
3. Testar um Evento que exija decisão e usar o controle docente para resolver uma decisão pendente.
4. Chegar à rodada 2, responder o Desafio e verificar que o professor controla **Resolver desafio** e **Prosseguir**.
5. Realizar todos os turnos e confirmar que abre a **Cúpula Diplomática**.
6. Fazer um país propor Acordo e outro aceitar; depois permitir que ambos ainda usem suas próprias iniciativas conforme aplicável.
7. Encerrar a Cúpula pelo professor e confirmar o início da rodada seguinte.
8. Exportar o relatório `.md` ou `.json` ao final.

## Arquivos

- `index.html` — carregamento e versão de cache
- `app.js` — interface Sala de Comando e controles
- `styles.css` — layout em tela inteira
- `game-api.ts` — motor 0.4-A, Cúpula e controle manual
