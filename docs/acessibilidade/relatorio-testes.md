# Relatório de testes de acessibilidade – CicloPonto

Testes da Fase 1 (itens F1.1 a F1.9), feitos no branch `melhorias-acessibilidade`.

**Ambientes usados nos testes já feitos:**
- *Navegador de desenvolvimento:* navegador Chromium do Claude Code, com a aplicação rodando localmente (`localhost`) e banco local, emulando telas de celular (360x740, 375x667, 375x812, 390x760) e de computador (1280x720, 1280x800).
- *Lighthouse:* versão 12.6.1, categoria Acessibilidade, modo Mobile, rodando no Google Chrome 156.

Linhas com o resultado em branco dependem de teste em aparelho real. As instruções estão na seção "Como fazer os testes pendentes".

## Tabela de testes

| Teste | Data | Aparelho e navegador | Resultado | Captura de tela |
|---|---|---|---|---|
| Lighthouse – antes dos ajustes | — | — | Não medido. Quando a medição foi tentada, a versão publicada já tinha parte das mudanças (F1.4, F1.6 e F1.8). | — |
| Lighthouse – versão publicada (com F1.1 a F1.9, exceto F1.3) | 02/11/2026 | Lighthouse 12.6.1, Mobile | Nota 100. Relatório em `lighthouse-publicado-2026-11-02.html`. | |
| Lighthouse – versão local com F1.2 | 02/11/2026 | Lighthouse 12.6.1, Mobile | Nota 100, nenhuma falha de nomes e rótulos | — |
| Lighthouse – depois (revisão de teste com toda a Fase 1) | | Chrome DevTools, Mobile | | `lighthouse-depois.html` |
| Contraste de cores (modos claro e noturno) | 02/11/2026 | Navegador de desenvolvimento, script de medição WCAG | Antes: 14 pares de cores abaixo do mínimo (43 ocorrências em 137 combinações). Depois: 0. Detalhes em `contraste.md`. | |
| Simulação de daltonismo (protanopia, deuteranopia, acromatopsia) | | Chrome DevTools > Rendering | | |
| Tamanho A++ em tela de 360 px | 02/11/2026 | Navegador de desenvolvimento, 360x740 | Aprovado. Legenda, menu, ficha e janelas ampliam; menu e ficha cabem na tela, com rolagem quando necessário; nada é cortado na horizontal. | |
| Zoom de 200% em tela de 360 px (equivale a 180 px de largura) | 02/11/2026 | Navegador de desenvolvimento, 180x370 | Aprovado. Abas do menu quebram de linha e a legenda vira o botão "Legenda", que abre e fecha; nada é cortado na horizontal. | |
| Escolha de fonte mantida ao reabrir o site | 02/11/2026 | Navegador de desenvolvimento | Aprovado (localStorage) | — |
| Navegação por teclado | 02/11/2026 | Navegador de desenvolvimento, 1280x800 | Aprovado. O Tab percorre menu, busca, filtros, modo noturno, A/A+/A++, painel, zoom e pins, nessa ordem. Enter abre a ficha do ponto. Nas janelas, o foco entra, o Tab fica preso dentro delas, o Esc fecha e o foco volta ao botão de origem. O foco é sempre visível. | |
| Área de toque (mínimo 44 x 44 px) | 02/11/2026 | Navegador de desenvolvimento, 375x812 | Aprovado. Todos os controles principais medem 44 px ou mais (lista no fim deste documento). | |
| Informação não transmitida só por cor (pins de alerta) | 02/11/2026 | Navegador de desenvolvimento | Aprovado. Selos "!" e ⊘, texto na ficha e legenda com Atenção e Crítico. | |
| Busca de endereço | 01/11/2026 | Navegador de desenvolvimento, computador e celular | Aprovado. Mapa centralizado, endereço destacado, aviso anunciado na região aria-live e mensagem clara quando o endereço não é encontrado. | |
| Botão Ouvir – comportamento | 02/11/2026 | Navegador de desenvolvimento (sem voz instalada; fala simulada) | Aprovado. Alterna entre Ouvir e Parar com aria-pressed, a leitura para ao fechar a ficha e o texto lido inclui nome, tipo, endereço, vagas, gratuidade, cobertura, vigilância e câmera. | — |
| Botão Ouvir – Chrome para Android | | | | |
| Botão Ouvir – Safari para iOS | | | | |
| TalkBack (Android): buscar um endereço | | | | |
| TalkBack (Android): abrir a ficha de um ponto | | | | |
| TalkBack (Android): ouvir as informações do ponto | | | | |
| VoiceOver (iOS): buscar um endereço | | | | |
| VoiceOver (iOS): abrir a ficha de um ponto | | | | |
| VoiceOver (iOS): ouvir as informações do ponto | | | | |
| Nenhuma tarefa exige uso em movimento | 02/11/2026 | Revisão das funções | Aprovado. Consulta, cadastro, edição e registro de ocorrência são feitos com a bicicleta parada, e o aviso de segurança aparece na ficha e no formulário. A navegação durante o trajeto é feita pelo Google Maps, no modo bicicleta. | |

## Como fazer os testes pendentes

Faça os testes na **revisão de teste** publicada no Cloud Run, que já deve ter toda a Fase 1. Anote data, aparelho e resultado na tabela e salve as capturas com os nomes sugeridos.

### Lighthouse – depois
1. No computador, abra a URL da revisão de teste no Chrome.
2. Aperte F12, abra a aba **Lighthouse**, marque só **Acessibilidade**, escolha **Mobile** e clique em **Analisar**.
3. Anote a nota e salve o relatório pelo menu ⋮ > *Save as HTML*, como `docs/acessibilidade/lighthouse-depois.html`.

### Simulação de daltonismo
1. Abra o site no Chrome, aperte F12 e depois Ctrl+Shift+P.
2. Digite **Rendering** e confirme.
3. Em **Emulate vision deficiencies**, escolha uma deficiência por vez: *Protanopia*, *Deuteranopia*, *Tritanopia* e *Achromatopsia*.
4. Em cada uma, confira se dá para distinguir os três tipos de ponto (pelos ícones de bicicleta, P e chave inglesa) e os alertas (pelos selos "!" e ⊘).

   Para ver um pin em alerta, registre uma ocorrência de teste. Ou, no console do DevTools, rode:

   `todosPontos[0].ultima_ocorrencia_tipo = 'Vandalismo'; renderizarPontos(todosPontos);`

   Isso muda só a tela, sem gravar nada no banco.
5. Salve uma captura de cada simulação (`daltonismo-protanopia.png` etc.).

### Botão Ouvir no celular
1. Abra o site, toque num pin e depois em **Ouvir**.
2. Confira se a voz é em português e lê todas as informações.
3. Toque em **Parar** no meio da leitura.
4. Toque em Ouvir de novo e feche a ficha no X: a voz deve parar.
5. No iPhone, desligue o modo silencioso antes (chave lateral).

### TalkBack (Android)
1. Ative em *Configurações > Acessibilidade > TalkBack*. Com ele ligado, toque uma vez para ouvir o item e duas vezes para ativar; deslize para a direita ou para a esquerda para ir ao próximo item ou ao anterior.
2. Faça as três tarefas:
   - **Buscar um endereço:** abra "Menu & Filtros", vá ao campo de busca, digite um endereço (por exemplo "Avenida Paulista, 1000") e ative o botão "Buscar endereço no mapa". O resultado deve ser anunciado.
   - **Abrir a ficha de um ponto:** feche o menu, deslize até um pin (o nome do ponto é anunciado) e toque duas vezes. A ficha abre e o nome do ponto é lido.
   - **Ouvir as informações:** na ficha, vá até o botão "Ouvir" e toque duas vezes.
3. Anote se conseguiu concluir cada tarefa, as dificuldades e o que precisou ser corrigido.

### VoiceOver (iOS)
1. Ative em *Ajustes > Acessibilidade > VoiceOver*. Os gestos são os mesmos do TalkBack: um toque para ouvir, dois para ativar e deslizar para navegar.
2. Faça as mesmas três tarefas do TalkBack e anote os resultados.

## Área de toque: controles ajustados (F1.6)

Medidos no navegador de desenvolvimento, em tela de 375 px.

| Controle | Antes | Depois |
|---|---|---|
| A / A+ / A++ | 36x20, 36x23, 36x25 | 44x44 cada |
| Modo noturno | 42x42 | 44x44 |
| Painel estatístico | 42x42 | 44x44 |
| Zoom + / − | 30x30 | 44x44 |
| Menu & Filtros | 143x36 | 143x44 |
| Fechar menu | 26x23 | 44x44 |
| Abas Explorar / Novo Ponto | 155x31 | 155x44 |
| Tipo de ponto | 320x36 | 320x44 |
| Filtros (Gratuitos, Cobertos, Segurança) | 320x20 | 320x44 |
| Fechar ficha do ponto | 24x24 | 44x44 |
| Rota no Google Maps | 34x34 | 46x46 |
| Editar / Excluir ponto | 80x12, 85x12 | 88x44, 93x44 |
| Registrar Ocorrência | 240x31 | 240x44 |
| Fechar janelas (×) | 11x23 | 44x44 |
| Salvar Ocorrência / Salvar Ponto | altura 36 | altura 44 |
| Botões do Painel Estatístico | 170x24 | 170x44 |
| Fechar aviso da busca | 32x32 | 44x44 |
| Buscar endereço | 44x44 | 44x44 (já atendia) |
| Ouvir (novo, F1.7) | — | 240x44 |
