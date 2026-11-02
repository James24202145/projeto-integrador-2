# Contraste de cores – CicloPonto (F1.3)

Data da verificação: 02/11/2026

## Critérios (WCAG 2.1, nível AA)

| Critério | O que vale | Razão mínima |
|---|---|---|
| 1.4.3 Contraste (mínimo) | Texto normal | 4,5:1 |
| 1.4.3 Contraste (mínimo) | Texto grande (a partir de 24 px, ou 18,66 px em negrito) | 3:1 |
| 1.4.11 Contraste não textual | Bordas de campos de formulário, ícones e elementos gráficos | 3:1 |

## Como foi medido

- Um script no navegador percorreu todos os elementos visíveis com texto, os placeholders dos campos e as bordas dos campos de formulário.
- Para cada um, comparou a cor do texto (ou da borda) com a cor de fundo efetiva, somando as camadas semitransparentes, e calculou a razão de contraste pela fórmula da WCAG.
- Telas verificadas, nos **modos claro e noturno**:
  - menu Explorar;
  - aviso de resultado e de erro da busca;
  - Novo Ponto (passo 1 e formulário);
  - ficha do ponto (normal, em alerta amarelo e em alerta vermelho, com ocorrência na lista);
  - janelas Registrar Ocorrência, Editar Ponto e Detalhe da Ocorrência;
  - Painel Estatístico.
- O ícone dentro do pin amarelo foi medido à parte (elemento gráfico).

## Resultado

| | Antes | Depois |
|---|---|---|
| Combinações verificadas (elemento + cores, nos dois modos) | 137 | 137 |
| Ocorrências abaixo do mínimo | 43 | **0** |
| Pares de cores distintos abaixo do mínimo | **14** (6 no modo claro, 8 no noturno) | **0** |

## Ajustes feitos

As novas cores são variáveis CSS em `:root` (modo claro), redefinidas em `body.dark-mode` (modo noturno), na seção "CONTRASTE (F1.3)" de `static/css/style.css`.

### Modo claro

| Elemento | Cores antes (texto / fundo) | Razão antes | Cores depois | Razão depois | Mínimo |
|---|---|---|---|---|---|
| Bordas dos campos (busca, tipo de ponto, formulários de novo ponto, ocorrência e edição) | #cccccc / #ffffff | 1,61:1 | #767676 / #ffffff | 4,54:1 | 3:1 |
| Placeholder de Latitude e Longitude ("Selecione...") | #757575 / #f5f5f5 | 4,23:1 | #6b6b6b / #f5f5f5 | 4,89:1 | 4,5:1 |
| "Editar Ponto" (ficha) e "Alterar Local" (novo ponto) | #0288d1 / #ffffff | 3,86:1 | #0277bd / #ffffff | 4,80:1 | 4,5:1 |
| "Não há ocorrências." (ficha) | #888888 / #ffffff | 3,54:1 | #666666 / #ffffff | 5,74:1 | 4,5:1 |
| Data da ocorrência na lista da ficha | #777777 / #fdf2f2 | 4,09:1 | #5f5f5f / #fdf2f2 | 5,83:1 | 4,5:1 |
| Ícone do tipo dentro do pin amarelo (alerta) | #ffffff / #fbc02d | 1,66:1 | #4e342e / #fbc02d | 6,84:1 | 3:1 |

### Modo noturno

| Elemento | Cores antes (texto / fundo) | Razão antes | Cores depois | Razão depois | Mínimo |
|---|---|---|---|---|---|
| Bordas dos campos | #444444 / #1e1e1e | 1,71:1 | #8a8a8a / #1e1e1e | 4,83:1 | 3:1 |
| Placeholders dos campos (busca, novo ponto, descrição da ocorrência) | #757575 / #2d2d2d | 2,99:1 | #a0a0a0 / #2d2d2d | 5,27:1 | 4,5:1 |
| Contador "121 pontos encontrados" e contador "0/1000" da descrição | #666666 / #1e1e1e | 2,90:1 | #b0b0b0 / #1e1e1e | 7,69:1 | 4,5:1 |
| Título "Detalhes do Local" (novo ponto) | #2e7d32 / #1e1e1e | 3,25:1 | #81c784 / #1e1e1e | 8,28:1 | 4,5:1 |
| "Editar Ponto" e "Alterar Local" | #0288d1 / #1e1e1e | 4,32:1 | #4fc3f7 / #1e1e1e | 8,32:1 | 4,5:1 |
| "Excluir Ponto" | #d32f2f / #1e1e1e | 3,35:1 | #ef9a9a / #1e1e1e | 7,75:1 | 4,5:1 |
| Data da ocorrência na lista da ficha | #777777 / #fdf2f2 | 4,09:1 | #5f5f5f / #fdf2f2 | 5,83:1 | 4,5:1 |
| Descrição na janela Detalhe da Ocorrência (fundo claro com texto claro) | #e0e0e0 / #f9f9f9 | 1,25:1 | #e0e0e0 / #2d2d2d | 10,43:1 | 4,5:1 |

## Combinações principais que já estavam adequadas

| Elemento | Cores (texto / fundo) | Razão |
|---|---|---|
| Botões verdes (Menu & Filtros, Salvar, Ouvir lendo, modo noturno) | #ffffff / #2e7d32 | 5,13:1 |
| Botão Registrar Ocorrência | #ffffff / #d32f2f | 4,98:1 |
| Ícone dos pins de Bicicletário | #ffffff / #2e7d32 | 5,13:1 |
| Ícone dos pins de Paraciclo | #ffffff / #0288d1 | 3,86:1 (mínimo 3:1) |
| Ícone dos pins de Oficina / Suporte | #ffffff / #e65100 | 3,79:1 (mínimo 3:1) |
| Ícone dos pins em alerta vermelho | #ffffff / #d32f2f | 4,98:1 (mínimo 3:1) |
| Selo "!" do alerta amarelo na legenda | #4e342e / #fbc02d | 6,84:1 |

## Limitações

- **Elementos sobre o mapa:** os pins, a atribuição "Leaflet | © OpenStreetMap" e os nomes de ruas ficam sobre as imagens do mapa, que mudam a cada região e zoom. Por isso não têm uma cor de fundo fixa para medir. Os pins têm borda branca e sombra para se destacarem.
- **Textos dentro dos gráficos:** o Chart.js desenha eixos e legendas dentro de uma imagem (canvas), fora do alcance do script. A descrição em texto de cada gráfico está disponível para leitores de tela (F1.2).
- **Botões desabilitados:** o botão "Adicionar / Preencher Detalhes" antes de escolher o local fica de fora, porque a WCAG isenta controles inativos.
