# GeoPoder Alpha 2.0d.1 — Ajustes de interface

Patch visual sobre a Alpha 2.0d. Não altera regras, cartas nem backend.

## Mudanças
- A Mesa de Situação deixou de dividir espaço com o histórico de ações e ganhou toda a área central disponível.
- “O que acabou de acontecer” foi movido para uma faixa compacta junto aos botões superiores.
- O Gabinete Nacional foi compactado: caixas de atributos, espaçamentos e badges menores para garantir que o quadro de Influência apareça inteiro mesmo em telas de Chromebook com menor altura útil.
- A área central ficou ligeiramente mais larga; as colunas do Gabinete e do Evento foram reduzidas sem remover informação.
- Cache atualizado para `20d1`.

## Publicação
Substitua no GitHub Pages:
- `index.html`
- `app.js`
- `styles.css`

Não é necessário alterar `config.js`, Supabase, SQL ou a Edge Function `game-api`.
