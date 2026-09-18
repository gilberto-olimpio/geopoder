# GeoPoder — Alpha 2.0f

**Subtítulo interno:** Gabinete de Governo / Sala de Comando  
**Regras:** 0.4-C  
**Base técnica:** Alpha 2.0d.3

## Objetivo desta versão

A 2.0f mantém a direção visual da Sala de Comando e otimiza o uso do espaço em telas de notebook e Chromebook. O motor multiplayer permanece baseado na 2.0d.3.

## Otimização da Sala de Comando

- A consulta de um Dossiê agora acontece dentro da **Mesa de Situação**, sem criar uma área abaixo da navegação.
- A carta consultada exibe imagem, contexto, efeito completo, disponibilidade e as ações **Jogar carta** e **Voltar à Mesa**.
- Decisões obrigatórias, Desafios, Eventos e outras fases críticas têm prioridade e fecham a consulta da carta.
- A faixa **Dossiês do Governo** ficou mais baixa e preserva todas as cartas visíveis.
- A carta em consulta recebe destaque na mão.
- O **Gabinete Nacional** ganhou resumo em duas colunas para Influência e Vantagem; atributos e relações cabem no painel sem desaparecer.
- O **Cenário Global** mantém nome, tipo e efeito do Evento visíveis sem barra de rolagem no uso normal.
- A **Mesa de Situação** não apresenta rolagem desnecessária nos estados comuns; fases com muitas escolhas continuam podendo rolar para não esconder ações.
- A grade passou a usar alturas adaptativas conforme a altura disponível da tela.

## Mudanças principais de UI/UX

- Nova **Sala de Comando** em tela cheia para Chromebook/desktop.
- Cabeçalho institucional com país, equipe, rodada, fase, sala e estado da conexão.
- **Gabinete Nacional** com indicadores 0–8 em barras, Influência, Vantagem e relações atuais.
- **Mesa de Situação** ampliada, com estados temáticos para turno, Desafio, compra, rolagem, decisões e Cúpula.
- **Cenário Global** apresentado como boletim internacional em papel de briefing.
- A mão virou **Dossiês do Governo**.
- A carta não é mais jogada diretamente da mão: o aluno primeiro abre o Dossiê, lê o efeito e só então confirma a jogada.
- Navegação inferior: Situação Mundial, Diplomacia, Inteligência, Histórico e Como Jogar.
- Tela final também usa a linguagem visual de Sala de Comando.

## Onboarding

Ao abrir uma partida pela primeira vez nesta versão, o aluno passa por quatro orientações curtas:

1. Você está no comando.
2. Gabinete Nacional.
3. Cenário Global.
4. Mesa de Situação e Dossiês.

Depois, orientações contextuais aparecem na primeira ocorrência de Evento, Desafio, Vantagem, turno, Reação e Cúpula.

A explicação de **Vantagem Geográfica** inclui os três usos:

- refazer uma rolagem própria de d6;
- reduzir em 1 uma perda de atributo;
- na compra, revelar 2 cartas, escolher 1 e descartar a outra.

O botão **Como Jogar** permite rever o tutorial neste dispositivo.

## Cartas piloto com novo padrão editorial

Cinco Dossiês receberam ilustração e camada editorial completa:

- #04 Investimento Produtivo
- #06 Fórum Econômico Regional
- #12 Fuga de Capitais
- #13 Guerra de Narrativas
- #27 Abertura Comercial

As imagens ficam em `assets/cards/`.

As demais cartas já usam o novo formato de Dossiê, mas ainda utilizam uma arte genérica. Isso é intencional: o padrão das cinco cartas piloto deve ser validado antes de produzir arte para as 28.

## Regra 0.4-C — Diplomacia como multiplicador

Esta versão introduz um buff experimental para tornar Acordos, Blocos e Relações Comerciais mais atraentes.

- **Infraestrutura Digital:** +1 Redes; com Relação Comercial ativa, +2 em vez de +1. Se um parceiro tiver Redes maiores, renove 1.
- **Diplomacia Multilateral:** +1 Diplomacia; com ao menos 1 Acordo, +2 em vez de +1 e mantém a leitura do topo do baralho.
- **Marca Cultural Global:** +1 Cultura; com Relação Comercial, +2 em vez de +1 e um parceiro pode renovar 1.
- **Investimento Produtivo:** sem parceiro, você +1 Economia; com parceiro comercial, você +2 e o parceiro +1.
- **Logística Integrada:** +1 Redes; em Bloco ativo, +2 em vez de +1 e mantém a proteção de Economia.
- **Fórum Econômico Regional:** +1 Diplomacia; em Bloco ativo, +2 em vez de +1 e ambos podem renovar 1.
- **Diversificação de Mercados:** +1 Economia; com Acordo ativo, +2 em vez de +1; com exatamente 2 Acordos também renova 1.
- **Produção Cultural em Rede:** +1 Cultura; com Relação Comercial, +2 em vez de +1 e mantém a cadeia de renovações.

Eventos que desligam bônus de Relação/Bloco continuam desligando também estes bônus de +2.

## Publicação

### Supabase

Não é necessário alterar a Edge Function nem executar SQL nesta versão.

### GitHub Pages

Substitua:

- `index.html`
- `app.js`
- `styles.css`
- a pasta `assets/`

Mantenha seu `config.js` atual. **Não substitua o config.js.**

O cache-bust da versão é `?v=20f`.

## Validação local feita

- `node --check app.js`: OK.
- estrutura, delimitadores e media queries de `styles.css` verificados.
- referências dos cinco assets de carta verificadas.

## O que observar no playtest

Esta versão deve ser testada principalmente para UX e Diplomacia:

- o aluno identifica em poucos segundos o que está acontecendo?
- entende como a ação o afeta?
- encontra o que pode fazer sem ajuda do professor?
- abrir o Dossiê antes de jogar diminui erros de interpretação?
- o onboarding ajuda sem interromper demais?
- Acordos e Blocos passam a ser desejados por causa dos bônus 0.4-C?
- as cinco cartas piloto parecem mais ligadas a acontecimentos do mundo real sem esconder o efeito mecânico?
- em resoluções de 1366×768 e 1366×600, os atributos, o Evento e os Dossiês permanecem integralmente acessíveis?
- ao consultar uma carta, a leitura e os botões permanecem dentro da Mesa de Situação?

A expansão visual para as 28 cartas deve ser feita depois desse teste.
