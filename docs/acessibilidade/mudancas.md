# O que mudou no CicloPonto – resumo para o relatório

Resumo em linguagem simples das melhorias de acessibilidade e de segurança de uso (Fase 1), feitas em novembro de 2026 no branch `melhorias-acessibilidade`.

## Para quem usa leitor de tela (cegos e pessoas com baixa visão)

- **Todos os botões têm nome.** O leitor de tela (TalkBack no Android, VoiceOver no iPhone) agora anuncia o que cada botão faz, por exemplo "Modo noturno", "Abrir painel estatístico" ou "Traçar rota de bicicleta até Estação Belém no Google Maps". Antes, vários botões só tinham um ícone e eram lidos apenas como "botão".
- **Os botões dizem se estão ativos:** modo noturno, tamanho da fonte, abas do menu e gráfico escolhido. Por exemplo, "Fonte grande, selecionado".
- **As janelas são anunciadas.** Ao abrir Registrar Ocorrência, Editar Ponto ou o Painel Estatístico, o leitor informa que uma janela abriu e lê o título. Ao fechar, a pessoa volta exatamente para onde estava.
- **Os pins do mapa têm nome:** o leitor lê o nome do ponto e, se houver, o alerta (por exemplo "Atenção: Vandalismo").
- **Os gráficos são descritos em texto,** por exemplo "Distribuição por Tipo de Infraestrutura. Bicicletário: 71; Paraciclo: 50".
- **O resultado da busca de endereço é falado** automaticamente.

## Para quem usa teclado

- Dá para usar o site todo com a tecla **Tab**, numa ordem lógica: menu, busca, filtros, botões de tela, zoom e pontos do mapa.
- O elemento selecionado fica sempre **destacado com um contorno azul**.
- **Enter** abre a ficha do ponto, e **Esc** fecha as janelas.

## Botão "Ouvir"

- A ficha de cada ponto ganhou o botão **Ouvir**. O celular lê em voz alta, em português, o nome, o tipo, o endereço, as vagas, se é gratuito, se é coberto e se tem vigilância e câmera, além do alerta, se houver.
- O mesmo botão vira **Parar** durante a leitura, e fechar a ficha interrompe a voz.
- Se o navegador não tiver esse recurso, o botão não aparece.

## Para quem tem baixa visão

- **A, A+ e A++ ampliam a página inteira,** inclusive legenda, rótulos, menu e fichas. Antes, só alguns elementos cresciam. A escolha fica salva para a próxima visita.
- **O zoom do celular continua liberado.** A página foi ajustada para não quebrar com zoom de 200%: nas telas muito estreitas, a legenda vira um botão "Legenda".
- **Cores com contraste adequado:** foram medidas 137 combinações de texto e fundo nos modos claro e noturno. As 14 combinações de cores que estavam abaixo do mínimo da norma (WCAG 2.1 AA) foram corrigidas, por exemplo bordas de campos quase invisíveis e textos cinza no modo noturno. Os detalhes estão em `contraste.md`.

## Para quem não distingue bem as cores (daltonismo)

- Os pins com alerta não dependem mais só da cor:
  - o **amarelo** tem um selo **"!"**: a última ocorrência foi vandalismo, avaria ou furto;
  - o **vermelho** tem um selo **⊘**: ponto fechado, ou lotado nas últimas 3 horas.
- A ficha do ponto explica o alerta por escrito, e a legenda ganhou as entradas "Atenção" e "Crítico".
- Os três tipos de ponto já tinham ícones diferentes (bicicleta, P e chave inglesa), além da cor.

## Para quem usa o celular na rua

- **Botões maiores:** todos os controles principais têm pelo menos 44 x 44 pixels, o tamanho recomendado para o toque com o dedo. Antes, os botões A, A+, A++ e o "×" de fechar eram bem menores.
- **Aviso de segurança de uso:** a ficha do ponto e o formulário de ocorrência mostram *"Consulte e registre ocorrências com a bicicleta parada. Durante o trajeto, siga a navegação por voz do Google Maps."*
- **Rota de bicicleta:** o botão de rota abre o Google Maps já no modo bicicleta.

## Busca de endereço

- Ao buscar um endereço, o mapa centraliza no local, que fica marcado com um pin roxo e um círculo de 500 metros.
- Um aviso diz quantos pontos de apoio existem por perto ou qual é o mais próximo e a que distância.
- Quando o endereço não é encontrado, uma mensagem clara orienta o usuário.

## Outras correções feitas no período

- **Cadastro de novos pontos:** voltou a funcionar (antes, o ponto não era salvo).
- **Gráficos de ocorrências do Painel Estatístico:**
  - passaram a mostrar dados reais do banco, em vez de números de exemplo;
  - o painel ganhou a visão "Situação dos Pontos".
- **Menu no celular:** não fica mais escondido atrás da legenda.
- **Ícone do clima:** voltou a aparecer, porque as nuvens brancas sumiam no fundo verde-claro.
- **Chave da API de clima:** saiu do código e passou a ficar em variável de ambiente.

## Significado dos pins amarelos e vermelhos (confirmado no código)

| Cor e selo | Quando aparece |
|---|---|
| Amarelo, com "!" (Atenção) | A última ocorrência registrada no ponto é Vandalismo, Avaria/Estrutura Danificada ou Ocorrência de Furto/Roubo |
| Vermelho, com ⊘ (Crítico) | A última ocorrência é Ponto de Apoio Fechado, ou Ponto de Apoio Lotado registrado nas últimas 3 horas |

## O que ficou de fora ou tem limitações

- **"Avaria" não foi trocado por "Defeito":** o grupo decidiu manter o termo, mais adequado para estruturas como bicicletários.
- **Escolher o local de um novo ponto exige tocar no mapa.** Quem usa só teclado ou leitor de tela ainda não consegue cadastrar pontos. Uma alternativa (digitar o endereço ou usar "Minha localização") fica para a Fase 2.
- **Os textos dentro dos gráficos** (eixos e legendas) não crescem com A+ e A++, mas cada gráfico tem descrição em texto para leitores de tela.
- **Não houve medição do Lighthouse "antes".** Quando ela foi tentada, o site publicado já tinha parte das melhorias. A versão publicada em 02/11/2026, com tudo exceto o ajuste de contraste, teve nota 100 em acessibilidade. O Lighthouse não avalia foco, tecla Esc nem janelas: esses ganhos aparecem nos testes com TalkBack e VoiceOver.
- **Testes em aparelhos reais pendentes:** botão Ouvir no Android e no iPhone, TalkBack, VoiceOver e simulação de daltonismo. Veja `relatorio-testes.md`.
