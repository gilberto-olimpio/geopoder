# GeoPoder — Alpha 2.0c
## Cartas Multiplayer + partidas com 3 ou 4 equipes

Esta versão parte da Alpha 2.0b.2 já validada e ativa o núcleo completo de ações dos jogadores no multiplayer.

## O que muda

### 1. As 28 cartas estão ativas
- Desenvolvimento (1–9)
- Interferência (10–17)
- Reações (18–23)
- Risco/Escolha (24–28)

O servidor controla alvos, perdas, transferências, rolagens, Vantagens, renovações, descarte, respostas de outros países e fim do turno.

### 2. Diplomacia multiplayer
Durante a Ação Principal, o jogador pode:
- propor Acordo Comercial;
- formar Bloco;
- trocar exatamente 1 carta por 1;
- sair de um Bloco;
- encerrar gratuitamente 1 Acordo durante o próprio turno, conforme a regra existente.

Propostas e respostas aparecem no aparelho do país que precisa decidir.

### 3. Reações
As cartas 18–23 não são usadas como Ação Principal. Quando o gatilho ocorre, o servidor abre automaticamente a janela de Reação no aparelho correto.

### 4. Três ou quatro equipes
A partida agora pode começar com 3 ou 4 países ocupados.
- Com 3 equipes, o quarto país fica fora da sessão.
- Ele não recebe cartas, não participa de Eventos/Desafios, não entra no ranking e não pode ser alvo.
- O baralho de Ações continua completo.

### 5. Países ocupados na entrada
Depois que a equipe digita o código da sala, o frontend consulta os assentos.
Países já escolhidos aparecem desativados e com indicação sutil da equipe que os ocupa.

O servidor continua sendo a autoridade. Se duas equipes tentarem ocupar o mesmo país quase simultaneamente, a restrição UNIQUE do banco impede a duplicidade e a segunda recebe uma mensagem para escolher outro país.

### 6. Ajustes vindos do playtest anterior
- Resultado do Desafio fica visível por 3 segundos e mostra contagem para a próxima fase.
- Notas do professor aparecem em uma seção própria no relatório visual.
- Notas também aparecem organizadas no Relatório Markdown.
- O rascunho de notas continua persistente.

## Atualização

### Supabase
1. Abra `Edge Functions > game-api > Code`.
2. Substitua todo o conteúdo pelo `game-api.ts` desta versão.
3. Clique em **Deploy**.

Não existe migration SQL nova nesta versão.

### GitHub Pages
Substitua, por cima dos arquivos atuais:
- `index.html`
- `app.js`
- `styles.css`

Não altere `config.js`.

Depois aguarde o deploy do Pages e faça `Ctrl+F5`.

## Roteiro recomendado para o primeiro playtest real

### Teste A — 3 equipes
1. Crie uma sala.
2. Entre com três equipes.
3. Confirme que o quarto país aparece vazio no lobby.
4. Inicie a partida.
5. Confirme que somente os três países participam do Evento, Desafio, turnos e ranking.

### Teste B — seleção de país
1. Entre com uma equipe em Aurora.
2. Em outro aparelho, digite o mesmo código.
3. Aurora deve aparecer desativada na lista.
4. Se dois aparelhos tentarem escolher o mesmo país ao mesmo tempo, apenas um deve conseguir.

### Teste C — cartas simples
Priorize observar:
- 1 Infraestrutura Digital
- 4 Investimento Produtivo
- 8 Conectividade Global
- 12 Fuga de Capitais
- 13 Guerra de Narrativas
- 24 Capital Especulativo

### Teste D — relações
Tente criar:
- Acordo Comercial;
- Bloco;
- Troca de cartas;
- substituição de terceiro Acordo;
- saída voluntária de Bloco;
- encerramento gratuito de Acordo.

### Teste E — Reações
Quando aparecerem, observe especialmente:
- 18 Mediação Internacional
- 19 Retaliação Comercial
- 20 Defesa Cibernética
- 21 Contracampanha Cultural
- 22 Solidariedade do Bloco
- 23 Cláusula de Salvaguarda

### Teste F — cartas de rolagem
- 24 Capital Especulativo
- 25 Investimento Estrangeiro Direto
- 28 Disputa de Influência

Verifique também a opção de gastar Vantagem para rerrolar.

## Para relatar problemas
Anote, se possível:
- sala;
- rodada;
- país/equipe;
- carta ou Evento envolvido;
- o que era esperado;
- o que aconteceu.

As notas podem ser salvas diretamente no painel do professor e posteriormente exportadas no Relatório `.md`.

## Observação de versão
Esta é a primeira revisão em que todas as 28 cartas entram no motor multiplayer. Ela é adequada para playtest real, mas interações raras entre Reações, dissolução de relações e Eventos ainda precisam ser observadas em partidas reais antes de tratarmos o conjunto como estável.
