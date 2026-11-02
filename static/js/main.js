// ==========================================
// 1. ESTADO GLOBAL E CONSTANTES
// ==========================================

// Lista de pontos carregada da API
let todosPontos = [];

// Instância do Chart.js (permite destruir/recriar o gráfico) e aba selecionada no painel
let meuGrafico = null;
let graficoSelecionado = null;

// Mapa Leaflet e camada onde os marcadores são desenhados
let map = null;
let camadaMarcadores = null;

// Destaque do endereço buscado e indicação de que o texto da busca é um endereço
let camadaBuscaEndereco = null;
let buscaPorEndereco = false;

const CENTRO_SP = [-23.55052, -46.633309];
const RAIO_PONTOS_PROXIMOS = 500; // metros

// Cor e ícone do pin de acordo com o tipo do ponto
const ESTILO_PIN_POR_TIPO = {
    'Bicicletário': { classeCor: 'pin-bicicletario', iconeFa: 'fa-bicycle' },
    'Paraciclo': { classeCor: 'pin-paraciclo', iconeFa: 'fa-square-parking' },
    'Oficina / Suporte': { classeCor: 'pin-oficina', iconeFa: 'fa-wrench' }
};
const ESTILO_PIN_PADRAO = { classeCor: 'pin-padrao', iconeFa: 'fa-parking' };

// Ocorrências que alteram a cor do pin
const OCORRENCIAS_ALERTA_VERMELHO = ['Ponto de Apoio Fechado', 'Ponto de Apoio Lotado'];
const OCORRENCIAS_ALERTA_AMARELO = ['Vandalismo', 'Avaria/Estrutura Danificada', 'Ocorrência de Furto/Roubo'];
const COR_ALERTA_VERMELHO = '#d32f2f';
const COR_ALERTA_AMARELO = '#fbc02d';

// Além da cor, cada alerta tem um selo com símbolo e um texto (a informação não depende só da cor)
const ALERTA_VERMELHO = { classeCor: 'pin-alerta-vermelho', classeSelo: 'pin-selo-vermelho', iconeSelo: 'fa-ban', rotulo: 'Crítico' };
const ALERTA_AMARELO = { classeCor: 'pin-alerta-amarelo', classeSelo: 'pin-selo-amarelo', iconeSelo: 'fa-exclamation', rotulo: 'Atenção' };

// Exibido na ficha do ponto e no formulário de ocorrência (o mesmo texto está no index.html)
const AVISO_SEGURANCA_USO = 'Consulte e registre ocorrências com a bicicleta parada. Durante o trajeto, siga a navegação por voz do Google Maps.';

// Tipos de ocorrência do formulário, com o nome curto usado nos gráficos
const ROTULOS_OCORRENCIA = {
    'Vandalismo': 'Vandalismo',
    'Avaria/Estrutura Danificada': 'Avaria',
    'Ocorrência de Furto/Roubo': 'Furto/Roubo',
    'Ponto de Apoio Lotado': 'Lotado',
    'Ponto de Apoio Fechado': 'Fechado'
};


// ==========================================
// 2. UTILITÁRIOS
// ==========================================

// Evita que aspas no nome do ponto quebrem atributos como aria-label
function escaparAtributo(texto) {
    return String(texto ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// Os campos booleanos chegam do MySQL como 0/1
function ehVerdadeiro(valor) {
    return valor === 1 || valor === true;
}

// Janelas abertas, da mais antiga para a mais recente, com o elemento que tinha o foco antes
const modaisAbertos = [];
const SELETOR_FOCAVEIS = 'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function elementosFocaveis(container) {
    return [...container.querySelectorAll(SELETOR_FOCAVEIS)].filter(el => el.offsetParent !== null);
}

// Abre a janela e leva o foco para dentro dela (primeiro controle depois do botão Fechar)
function exibirModal(id) {
    const modal = document.getElementById(id);
    if (!modaisAbertos.some(m => m.id === id)) {
        modaisAbertos.push({ id, focoAnterior: document.activeElement });
    }
    modal.style.display = 'flex';

    const focaveis = elementosFocaveis(modal);
    const alvo = focaveis.find(el => !el.classList.contains('fechar-modal')) || focaveis[0];
    if (alvo) alvo.focus();
}

// Fecha a janela e devolve o foco a quem a abriu
function ocultarModal(id) {
    document.getElementById(id).style.display = 'none';

    const indice = modaisAbertos.findIndex(m => m.id === id);
    if (indice === -1) return;
    const { focoAnterior } = modaisAbertos.splice(indice, 1)[0];
    if (focoAnterior && focoAnterior.isConnected) focoAnterior.focus();
}

// Esc fecha a janela do topo; Tab circula só entre os controles dela
function inicializarTecladoModais() {
    document.addEventListener('keydown', evento => {
        const topo = modaisAbertos[modaisAbertos.length - 1];
        if (!topo) return;
        const modal = document.getElementById(topo.id);

        if (evento.key === 'Escape') {
            evento.preventDefault();
            modal.querySelector('.fechar-modal').click();
            return;
        }

        if (evento.key === 'Tab') {
            const focaveis = elementosFocaveis(modal);
            if (focaveis.length === 0) return;
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];

            if (evento.shiftKey && (document.activeElement === primeiro || !modal.contains(document.activeElement))) {
                evento.preventDefault();
                ultimo.focus();
            } else if (!evento.shiftKey && (document.activeElement === ultimo || !modal.contains(document.activeElement))) {
                evento.preventDefault();
                primeiro.focus();
            }
        }
    });
}

// Busca os pontos na API e atualiza a lista global
function recarregarPontos() {
    return fetch('/api/pontos')
        .then(res => res.json())
        .then(dados => {
            todosPontos = dados;
            return dados;
        });
}


// ==========================================
// 3. ACESSIBILIDADE E INTERFACE
// ==========================================

const CHAVE_TAMANHO_FONTE = 'cicloponto-tamanho-fonte';
const CLASSE_POR_TAMANHO_FONTE = { 'grande': 'font-large', 'muito-grande': 'font-xlarge' };

// Ajusta o tamanho da fonte na raiz (os textos usam rem) e guarda a escolha do usuário
function mudarTamanhoFonte(tamanho) {
    const raiz = document.documentElement;

    raiz.classList.remove('font-large', 'font-xlarge');
    if (CLASSE_POR_TAMANHO_FONTE[tamanho]) {
        raiz.classList.add(CLASSE_POR_TAMANHO_FONTE[tamanho]);
    }

    // Indica ao leitor de tela qual tamanho está selecionado
    document.querySelectorAll('.btn-fonte').forEach(btn => {
        btn.setAttribute('aria-pressed', btn.dataset.tamanho === tamanho);
    });

    // O armazenamento pode estar bloqueado (navegação privada); a fonte muda mesmo assim
    try {
        localStorage.setItem(CHAVE_TAMANHO_FONTE, tamanho);
    } catch (e) { }
}

// Reaplica o tamanho escolhido em uma visita anterior
function restaurarTamanhoFonte() {
    try {
        const tamanho = localStorage.getItem(CHAVE_TAMANHO_FONTE);
        if (tamanho) mudarTamanhoFonte(tamanho);
    } catch (e) { }
}

// Abre e fecha a legenda quando ela vira botão (telas muito estreitas)
function inicializarLegenda() {
    const botao = document.getElementById('btn-legenda');
    const legenda = document.getElementById('legenda-mapa');

    botao.addEventListener('click', () => {
        const aberta = legenda.classList.toggle('aberta');
        botao.setAttribute('aria-expanded', aberta);
    });
}

// Alterna entre Modo Claro e Modo Escuro
function alternarTema() {
    const iconeTema = document.getElementById('icone-tema');

    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    if (iconeTema) iconeTema.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    document.getElementById('btn-tema').setAttribute('aria-pressed', isDark);
}

// Alterna entre as abas do painel lateral
function mudarAba(aba) {
    const abaExplorar = document.getElementById('aba-explorar');
    const abaAdicionar = document.getElementById('aba-adicionar');
    const botoes = document.querySelectorAll('.tab-btn');
    const explorar = aba === 'explorar';

    botoes.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });

    if (abaExplorar) abaExplorar.style.display = explorar ? 'flex' : 'none';
    if (abaAdicionar) abaAdicionar.style.display = explorar ? 'none' : 'flex';

    const botaoAtivo = botoes[explorar ? 0 : 1];
    if (botaoAtivo) {
        botaoAtivo.classList.add('active');
        botaoAtivo.setAttribute('aria-selected', 'true');
    }
}

// Mostra/oculta o painel lateral em celulares
function inicializarMenuMobile() {
    const sidebar = document.getElementById('sidebarPanel');
    const toggleBtn = document.getElementById('toggleMenuBtn');
    const closeBtn = document.getElementById('closeMenuBtn');

    if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.add('mobile-hidden');
    }

    if (toggleBtn && closeBtn && sidebar) {
        // Ao abrir, o foco vai para o botão Fechar do menu; ao fechar, volta ao botão Menu
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.remove('mobile-hidden');
            toggleBtn.setAttribute('aria-expanded', 'true');
            closeBtn.focus();
        });
        closeBtn.addEventListener('click', () => {
            sidebar.classList.add('mobile-hidden');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.focus();
        });
    }
}


// ==========================================
// 4. MODAIS
// ==========================================

// Edição de ponto
function abrirModalEdicao(idPonto) {
    document.getElementById('edit-ponto-id').value = idPonto;

    // Procura os dados atuais do ponto na lista carregada
    const ponto = todosPontos.find(p => (p.id_ponto || p.id) == idPonto);

    if (ponto) {
        document.getElementById('edit-vagas').value = ponto.capacidade_vagas || 0;
        document.getElementById('edit-gratuito').checked = ehVerdadeiro(ponto.gratuito);
        document.getElementById('edit-coberto').checked = ehVerdadeiro(ponto.coberto);
        document.getElementById('edit-vigilancia').checked = ehVerdadeiro(ponto.vigilancia_humana);
        document.getElementById('edit-cameras').checked = ehVerdadeiro(ponto.cameras);
    }

    exibirModal('modal-editar-ponto');
}

function fecharModalEdicao() {
    ocultarModal('modal-editar-ponto');
    document.getElementById('form-editar-ponto').reset();
}

// Registro de ocorrência
function abrirModalOcorrencia(idPonto) {
    document.getElementById('ocorrencia-ponto-id').value = idPonto;
    exibirModal('modal-ocorrencia');
}

function fecharModalOcorrencia() {
    ocultarModal('modal-ocorrencia');
    document.getElementById('form-ocorrencia').reset();
    const contador = document.getElementById('contador-caracteres');
    if (contador) contador.textContent = '0/1000';
}

// Detalhe de ocorrência
function abrirModalDetalhe(tipo, data, descricao) {
    document.getElementById('detalhe-tipo').textContent = tipo;
    document.getElementById('detalhe-data').textContent = data;
    document.getElementById('detalhe-descricao').textContent = descricao;
    exibirModal('modal-detalhe-ocorrencia');
}

function fecharModalDetalhe() {
    ocultarModal('modal-detalhe-ocorrencia');
}

// Estatísticas
function abrirModalEstatisticas() {
    const modal = document.getElementById('modal-estatisticas');
    if (modal) {
        exibirModal('modal-estatisticas');
        const primeiroBotao = document.querySelector('.btn-aba-grafico');
        carregarGrafico('infraestrutura', primeiroBotao);
    } else {
        console.error("Erro: O elemento modal-estatisticas não foi encontrado no HTML.");
    }
}

function fecharModalEstatisticas() {
    ocultarModal('modal-estatisticas');
}


// ==========================================
// 5. GRÁFICOS (Chart.js)
// ==========================================

function desenharGrafico(tipoGrafico, labels, dataset, titulo, opcoesExtras = {}) {
    const ctx = document.getElementById('meuGraficoChart').getContext('2d');

    if (meuGrafico) {
        meuGrafico.destroy();
    }

    // O gráfico é uma imagem para o leitor de tela: o título e os valores viram a descrição
    const valores = labels.map((rotulo, i) => `${rotulo}: ${dataset.data[i]}`).join('; ');
    document.getElementById('meuGraficoChart').setAttribute('aria-label', `${titulo}. ${valores}`);

    meuGrafico = new Chart(ctx, {
        type: tipoGrafico,
        data: { labels: labels, datasets: [dataset] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { title: { display: true, text: titulo } },
            ...opcoesExtras
        }
    });
}

// Aviso sobre a área do gráfico quando não há dados para exibir (texto vazio esconde)
function mostrarAvisoGrafico(texto) {
    const aviso = document.getElementById('grafico-sem-dados');
    aviso.textContent = texto;
    aviso.hidden = !texto;
}

// Contagens são sempre inteiras: evita marcações como 0,5 no eixo
const EIXO_CONTAGEM = { beginAtZero: true, ticks: { precision: 0 } };

function graficoInfraestrutura() {
    const contagem = {};
    todosPontos.forEach(p => {
        contagem[p.tipo] = (contagem[p.tipo] || 0) + 1;
    });

    desenharGrafico('doughnut', Object.keys(contagem), {
        data: Object.values(contagem),
        backgroundColor: ['#2e7d32', '#0288d1', '#f57c00', '#7b1fa2']
    }, 'Distribuição por Tipo de Infraestrutura');
}

function graficoGratuidade() {
    const gratuitos = todosPontos.filter(p => ehVerdadeiro(p.gratuito)).length;
    const pagos = todosPontos.length - gratuitos;

    desenharGrafico('bar', ['Gratuitos', 'Pagos / Restritos'], {
        label: 'Quantidade de Pontos',
        data: [gratuitos, pagos],
        backgroundColor: ['#4caf50', '#ff9800']
    }, 'Gratuidade dos Pontos de Apoio');
}

function graficoSeguranca() {
    const comSeg = todosPontos.filter(p => ehVerdadeiro(p.seguranca_geral)).length;
    const semSeg = todosPontos.length - comSeg;

    desenharGrafico('pie', ['Com Elemento de Segurança', 'Sem Segurança Registrada'], {
        data: [comSeg, semSeg],
        backgroundColor: ['#2e7d32', '#d32f2f']
    }, 'Panorama de Segurança da Rede');
}

function graficoVagas() {
    const vagasPorTipo = {};
    todosPontos.forEach(p => {
        const t = p.tipo || 'Outros';
        vagasPorTipo[t] = (vagasPorTipo[t] || 0) + (p.capacidade_vagas || 0);
    });

    desenharGrafico('bar', Object.keys(vagasPorTipo), {
        label: 'Total de Vagas',
        data: Object.values(vagasPorTipo),
        backgroundColor: '#0288d1'
    }, 'Capacidade Total de Vagas por Categoria');
}

// Situação de cada ponto pela última ocorrência, a mesma regra que colore os pins
function graficoSituacaoPontos() {
    let criticos = 0;
    let atencao = 0;
    todosPontos.forEach(p => {
        if (OCORRENCIAS_ALERTA_VERMELHO.includes(p.ultima_ocorrencia_tipo)) criticos++;
        else if (OCORRENCIAS_ALERTA_AMARELO.includes(p.ultima_ocorrencia_tipo)) atencao++;
    });
    const normais = todosPontos.length - criticos - atencao;

    desenharGrafico('doughnut', [
        'Sem alertas',
        'Atenção (vandalismo, avaria ou furto)',
        'Crítico (fechado ou lotado nas últimas 3h)'
    ], {
        data: [normais, atencao, criticos],
        backgroundColor: ['#2e7d32', COR_ALERTA_AMARELO, COR_ALERTA_VERMELHO]
    }, `Situação Atual dos ${todosPontos.length} Pontos de Apoio`);
}

// Busca os totais de ocorrências e desenha o gráfico só se a aba ainda estiver selecionada
function carregarEstatisticasOcorrencias(aba, desenhar) {
    fetch('/api/estatisticas/ocorrencias')
        .then(res => res.json())
        .then(dados => {
            if (graficoSelecionado !== aba) return;
            if (!dados.sucesso) throw new Error(dados.mensagem);
            desenhar(dados);
        })
        .catch(() => {
            if (graficoSelecionado === aba) {
                mostrarAvisoGrafico('Não foi possível carregar as ocorrências. Tente novamente.');
            }
        });
}

function graficoTiposOcorrencia() {
    carregarEstatisticasOcorrencias('ocorrencias_tipo', dados => {
        // Todos os tipos aparecem, mesmo sem relatos; tipos fora do formulário entram no fim
        const contagem = {};
        Object.keys(ROTULOS_OCORRENCIA).forEach(tipo => { contagem[tipo] = 0; });
        dados.por_tipo.forEach(linha => { contagem[linha.tipo] = linha.total; });
        const tipos = Object.keys(contagem);

        desenharGrafico('bar', tipos.map(tipo => ROTULOS_OCORRENCIA[tipo] || tipo), {
            label: 'Ocorrências registradas',
            data: tipos.map(tipo => contagem[tipo]),
            backgroundColor: tipos.map(tipo =>
                OCORRENCIAS_ALERTA_VERMELHO.includes(tipo) ? COR_ALERTA_VERMELHO : COR_ALERTA_AMARELO)
        }, `Ocorrências por Tipo (${dados.total} no total)`, {
            indexAxis: 'y',
            scales: { x: EIXO_CONTAGEM }
        });

        if (dados.total === 0) mostrarAvisoGrafico('Nenhuma ocorrência registrada até agora.');
    });
}

function graficoEvolucaoOcorrencias() {
    carregarEstatisticasOcorrencias('ocorrencias_tempo', dados => {
        const totalPeriodo = dados.por_dia.reduce((soma, dia) => soma + dia.total, 0);

        desenharGrafico('line', dados.por_dia.map(dia => dia.data), {
            label: 'Relatos no dia',
            data: dados.por_dia.map(dia => dia.total),
            borderColor: '#e65100',
            backgroundColor: 'rgba(230, 81, 0, 0.15)',
            fill: true,
            tension: 0.3
        }, `Relatos nos Últimos ${dados.por_dia.length} Dias (${totalPeriodo} no período)`, {
            scales: { y: EIXO_CONTAGEM }
        });

        if (totalPeriodo === 0) mostrarAvisoGrafico('Nenhum relato registrado nos últimos 30 dias.');
    });
}

const GRAFICOS = {
    infraestrutura: graficoInfraestrutura,
    gratuidade: graficoGratuidade,
    seguranca: graficoSeguranca,
    vagas: graficoVagas,
    situacao: graficoSituacaoPontos,
    ocorrencias_tipo: graficoTiposOcorrencia,
    ocorrencias_tempo: graficoEvolucaoOcorrencias
};

function carregarGrafico(tipo, elementoBotao) {
    if (elementoBotao) {
        document.querySelectorAll('.btn-aba-grafico').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        elementoBotao.classList.add('active');
        elementoBotao.setAttribute('aria-pressed', 'true');
    }

    if (meuGrafico) {
        meuGrafico.destroy();
        meuGrafico = null;
    }

    graficoSelecionado = tipo;
    mostrarAvisoGrafico('');
    const desenhar = GRAFICOS[tipo];
    if (desenhar) desenhar();
}


// ==========================================
// 6. CLIMA (OpenWeatherMap)
// ==========================================

function carregarClima() {
    fetch('/api/clima')
        .then(res => res.json())
        .then(data => {
            if (data.sucesso && data.clima) {
                const tempEl = document.getElementById('weather-temp');
                const descEl = document.getElementById('weather-desc');
                const iconEl = document.getElementById('weather-icon');

                if (tempEl) tempEl.textContent = `${data.clima.temperatura}°C`;
                if (descEl) descEl.textContent = data.clima.descricao;
                if (iconEl) {
                    iconEl.src = data.clima.icone;
                    iconEl.style.display = 'block';
                }
            }
        })
        .catch(err => console.error('Erro ao carregar clima:', err));
}


// ==========================================
// 7. MAPA E MARCADORES
// ==========================================

function inicializarMapa() {
    map = L.map('map', { zoomControl: false }).setView(CENTRO_SP, 12);
    L.control.zoom({ zoomInTitle: 'Aproximar o mapa', zoomOutTitle: 'Afastar o mapa' }).addTo(map);

    // O Leaflet coloca os controles depois dos pins; trazê-los para o início faz o Tab
    // chegar ao zoom antes de percorrer os pontos (a posição na tela não muda)
    const containerMapa = map.getContainer();
    const controles = containerMapa.querySelector('.leaflet-control-container');
    if (controles) containerMapa.insertBefore(controles, containerMapa.firstChild);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    camadaMarcadores = L.layerGroup().addTo(map);

    // No celular a legenda sai da frente enquanto a ficha de um ponto está aberta
    map.on('popupopen', evento => {
        document.body.classList.add('ficha-aberta');

        // Botão Fechar em português e foco no título da ficha, para o leitor de tela anunciá-la
        const elementoFicha = evento.popup.getElement();
        const fechar = elementoFicha.querySelector('.leaflet-popup-close-button');
        if (fechar) fechar.setAttribute('aria-label', 'Fechar ficha do ponto');
        const titulo = elementoFicha.querySelector('.popup-titulo');
        if (titulo) titulo.focus();
    });
    map.on('popupclose', () => document.body.classList.remove('ficha-aberta'));
}

// Alerta do ponto de acordo com a última ocorrência (null quando não há alerta)
function obterAlerta(ultimaOcorrencia) {
    if (OCORRENCIAS_ALERTA_VERMELHO.includes(ultimaOcorrencia)) return ALERTA_VERMELHO;
    if (OCORRENCIAS_ALERTA_AMARELO.includes(ultimaOcorrencia)) return ALERTA_AMARELO;
    return null;
}

// Cria o ícone L.divIcon com base no tipo e na última ocorrência
function obterIconePersonalizado(tipo, ultimaOcorrencia) {
    const estilo = ESTILO_PIN_POR_TIPO[tipo] || ESTILO_PIN_PADRAO;
    const alerta = obterAlerta(ultimaOcorrencia);
    const classeCor = alerta ? alerta.classeCor : estilo.classeCor;
    const selo = alerta
        ? `<span class="pin-selo ${alerta.classeSelo}"><i class="fa-solid ${alerta.iconeSelo}" aria-hidden="true"></i></span>`
        : '';

    return L.divIcon({
        className: 'custom-pin-wrapper',
        html: `<div class="custom-pin ${classeCor}"><i class="fa-solid ${estilo.iconeFa}" aria-hidden="true"></i></div>${selo}`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    });
}

function montarAlertaPopupHtml(ultimaOcorrencia) {
    const alerta = obterAlerta(ultimaOcorrencia);
    if (!alerta) return '';

    return `
            <p class="popup-alerta ${alerta.classeSelo}">
                <i class="fa-solid ${alerta.iconeSelo}" aria-hidden="true"></i>
                <span><strong>${alerta.rotulo}:</strong> última ocorrência registrada foi "${ultimaOcorrencia}".</span>
            </p>`;
}

function montarPopupHtml(ponto, idPonto) {
    const nomeAtributo = escaparAtributo(ponto.nome);
    return `
        <div class="popup-content">
            <span class="popup-tag">${ponto.tipo}</span>
            ${montarAlertaPopupHtml(ponto.ultima_ocorrencia_tipo)}

            <!-- Cabeçalho com Título e Botão de Rota do Google Maps -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
                <h3 class="popup-titulo" tabindex="-1" style="margin: 0; flex: 1;">${ponto.nome}</h3>
                <a aria-label="Traçar rota de bicicleta até ${nomeAtributo} no Google Maps (abre em nova aba)" href="https://www.google.com/maps/dir/?api=1&destination=${ponto.latitude},${ponto.longitude}&travelmode=bicycling"
                   target="_blank"
                   title="Traçar rota de bicicleta no Google Maps"
                   style="background-color: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 1.125rem; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <i class="fa-solid fa-person-biking" aria-hidden="true"></i>
                </a>
            </div>
            <!-- Ações: Editar e Excluir lado a lado -->
            <div style="display: flex; gap: 12px; margin-bottom: 4px;">
                <button class="popup-acao" aria-label="Editar ponto ${nomeAtributo}" onclick="abrirModalEdicao(${idPonto})" style="background: none; border: none; color: #0288d1; font-size: 0.6875rem; font-weight: 600; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Editar Ponto
                </button>
                <button class="popup-acao" aria-label="Excluir ponto ${nomeAtributo}" onclick="excluirPonto(${idPonto})" style="background: none; border: none; color: #d32f2f; font-size: 0.6875rem; font-weight: 600; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-trash-can" aria-hidden="true"></i> Excluir Ponto
                </button>
            </div>

            <p><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${ponto.endereco}</p>
            <p><i class="fa-solid fa-shield" aria-hidden="true"></i> <strong>Segurança:</strong> ${ponto.seguranca_geral ? 'Sim' : 'Não'}</p>
            <p><i class="fa-solid fa-layer-group" aria-hidden="true"></i> <strong>Vagas:</strong> ${ponto.capacidade_vagas || 'N/I'}</p>
            <p><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> <strong>Coberto:</strong> ${ponto.coberto ? 'Sim' : 'Não'}</p>
            <p><i class="fa-solid fa-tag" aria-hidden="true"></i> <strong>Gratuito:</strong> ${ponto.gratuito ? 'Sim' : 'Não'}</p>

            <div class="popup-ocorrencias-container">
                <h4>Últimas Ocorrências</h4>
                <div id="lista-oc-${idPonto}" class="lista-ocorrencias-popup">
                    <span class="sem-ocorrencias">Carregando...</span>
                </div>
            </div>

            <p class="aviso-seguranca-uso" role="note">
                <i class="fa-solid fa-hand" aria-hidden="true"></i>
                <span>${AVISO_SEGURANCA_USO}</span>
            </p>

            <button class="btn-ocorrencia" onclick="abrirModalOcorrencia(${idPonto})">
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Registrar Ocorrência
            </button>
        </div>
    `;
}

function montarItemOcorrenciaHtml(oc) {
    const tipoEscapado = oc.tipo.replace(/'/g, "\\'");
    const dataEscapada = oc.data_relato.replace(/'/g, "\\'");
    const descEscapada = (oc.descricao || '').replace(/'/g, "\\'").replace(/\n/g, ' ');

    return `
        <button type="button" class="item-ocorrencia-popup" onclick="abrirModalDetalhe('${tipoEscapado}', '${dataEscapada}', '${descEscapada}')">
            <span class="tipo"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> ${oc.tipo}</span>
            <span class="data">${oc.data_relato}</span>
        </button>
    `;
}

// Preenche a lista de ocorrências do popup quando ele é aberto
function carregarOcorrenciasPopup(idPonto) {
    const SEM_OCORRENCIAS = '<span class="sem-ocorrencias">Não há ocorrências.</span>';

    fetch(`/api/pontos/${idPonto}/ocorrencias`)
        .then(res => res.json())
        .then(ocorrencias => {
            const container = document.getElementById(`lista-oc-${idPonto}`);
            if (!container) return;

            if (!Array.isArray(ocorrencias) || ocorrencias.length === 0) {
                container.innerHTML = SEM_OCORRENCIAS;
                return;
            }

            container.innerHTML = ocorrencias.map(montarItemOcorrenciaHtml).join('');
        })
        .catch(() => {
            const container = document.getElementById(`lista-oc-${idPonto}`);
            if (container) container.innerHTML = SEM_OCORRENCIAS;
        });
}

// Renderiza os pontos no mapa
function renderizarPontos(pontos) {
    camadaMarcadores.clearLayers();

    // Com A+ e A++ a ficha cresce: limita a altura (com rolagem) e, no celular, a largura,
    // para ela não ficar por baixo do menu (topo) nem da coluna de botões (direita)
    const OPCOES_POPUP_PONTO = {
        maxHeight: Math.max(window.innerHeight - 140, 250),
        maxWidth: Math.min(300, window.innerWidth - 90),
        autoPanPaddingTopLeft: [10, 70],
        autoPanPaddingBottomRight: [64, 10]
    };

    pontos.forEach(ponto => {
        const icone = obterIconePersonalizado(ponto.tipo, ponto.ultima_ocorrencia_tipo);
        const alerta = obterAlerta(ponto.ultima_ocorrencia_tipo);
        const titulo = alerta ? `${ponto.nome} (${alerta.rotulo}: ${ponto.ultima_ocorrencia_tipo})` : ponto.nome;
        const marker = L.marker([ponto.latitude, ponto.longitude], { icon: icone, title: titulo });
        const idPonto = ponto.id_ponto || ponto.id;

        marker.bindPopup(montarPopupHtml(ponto, idPonto), OPCOES_POPUP_PONTO);
        marker.on('popupopen', () => carregarOcorrenciasPopup(idPonto));

        camadaMarcadores.addLayer(marker);
    });

    const totalEl = document.getElementById('total-pontos');
    if (totalEl) totalEl.textContent = pontos.length;
}

// Exclui o ponto e atualiza o mapa sem recarregar a página
function excluirPonto(idPonto) {
    if (!confirm('Tem certeza de que deseja excluir este ponto de apoio? Todos os registros e ocorrências associados serão removidos permanentemente.')) {
        return;
    }

    fetch(`/api/pontos/${idPonto}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                map.closePopup();
                alert('Ponto excluído com sucesso!');
                recarregarPontos().then(renderizarPontos);
            } else {
                alert('Erro ao excluir: ' + data.mensagem);
            }
        })
        .catch(err => console.error('Erro na requisição:', err));
}


// ==========================================
// 8. FILTROS E BUSCA
// ==========================================

// Pontos que atendem aos filtros. Depois de uma busca de endereço, o texto não filtra por nome
function filtrarPontos() {
    const textoBusca = buscaPorEndereco ? '' : document.getElementById('input-busca').value.toLowerCase();
    const tipoSelecionado = document.getElementById('select-tipo').value;
    const apenasGratuito = document.getElementById('check-gratuito').checked;
    const apenasCoberto = document.getElementById('check-coberto').checked;
    const apenasSeguranca = document.getElementById('check-seguranca').checked;

    return todosPontos.filter(ponto => {
        const atendeTexto = ponto.nome.toLowerCase().includes(textoBusca) ||
                            ponto.endereco.toLowerCase().includes(textoBusca);

        const atendeTipo = tipoSelecionado === 'todos' || ponto.tipo === tipoSelecionado;
        const atendeGratuito = !apenasGratuito || ehVerdadeiro(ponto.gratuito);
        const atendeCoberto = !apenasCoberto || ehVerdadeiro(ponto.coberto);
        const atendeSeguranca = !apenasSeguranca || ehVerdadeiro(ponto.seguranca) || ehVerdadeiro(ponto.seguranca_geral);

        return atendeTexto && atendeTipo && atendeGratuito && atendeCoberto && atendeSeguranca;
    });
}

function aplicarFiltros() {
    renderizarPontos(filtrarPontos());
}

function inicializarFiltros() {
    const campos = [
        ['select-tipo', 'change'],
        ['check-gratuito', 'change'],
        ['check-coberto', 'change'],
        ['check-seguranca', 'change']
    ];

    campos.forEach(([id, evento]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.addEventListener(evento, aplicarFiltros);
    });
}


// ==========================================
// 9. BUSCA DE ENDEREÇO
// ==========================================

// Mostra o resultado sobre o mapa; a região aria-live faz o leitor de tela anunciá-lo
function mostrarAvisoBusca(texto, erro) {
    const aviso = document.getElementById('aviso-busca');
    aviso.classList.toggle('erro', !!erro);
    aviso.classList.add('visivel');
    document.getElementById('aviso-busca-texto').textContent = texto;
}

function fecharAvisoBusca() {
    document.getElementById('aviso-busca').classList.remove('visivel', 'erro');
    document.getElementById('aviso-busca-texto').textContent = '';
}

function limparDestaqueBusca() {
    if (camadaBuscaEndereco) {
        map.removeLayer(camadaBuscaEndereco);
        camadaBuscaEndereco = null;
    }
}

// Marca o endereço com um pin próprio e um círculo do raio considerado "próximo"
function destacarEnderecoBuscado(latlng, endereco) {
    limparDestaqueBusca();

    const circulo = L.circle(latlng, {
        radius: RAIO_PONTOS_PROXIMOS,
        color: '#6a1b9a',
        weight: 2,
        fillOpacity: 0.08
    });

    const rotulo = document.createElement('span');
    rotulo.textContent = endereco;

    const marcador = L.marker(latlng, {
        zIndexOffset: 1000,
        keyboard: false,
        icon: L.divIcon({
            className: 'custom-pin-wrapper',
            html: '<div class="custom-pin pin-endereco-busca"><i class="fa-solid fa-location-dot" aria-hidden="true"></i></div>',
            iconSize: [34, 34],
            iconAnchor: [17, 34]
        })
    }).bindTooltip(rotulo, { permanent: true, direction: 'top', offset: [0, -34] });

    camadaBuscaEndereco = L.layerGroup([circulo, marcador]).addTo(map);
    return circulo.getBounds();
}

// Pontos ordenados pela distância (em metros) até o endereço
function ordenarPorDistancia(latlng, pontos) {
    return pontos
        .map(p => ({ ponto: p, distancia: map.distance(latlng, [p.latitude, p.longitude]) }))
        .sort((a, b) => a.distancia - b.distancia);
}

function formatarDistancia(metros) {
    return metros < 1000
        ? `${Math.round(metros / 10) * 10} m`
        : `${(metros / 1000).toFixed(1).replace('.', ',')} km`;
}

// Quando o texto é o nome de um ponto, mostra esses pontos em vez de buscar um endereço
function mostrarPontosPorNome(termo) {
    const texto = termo.toLowerCase();
    const pontos = filtrarPontos().filter(p => p.nome.toLowerCase().includes(texto));
    if (pontos.length === 0) return false;

    limparDestaqueBusca();
    map.fitBounds(L.latLngBounds(pontos.map(p => [p.latitude, p.longitude])), { maxZoom: 16, padding: [40, 40] });

    const lista = pontos.slice(0, 3).map(p => p.nome).join(', ') + (pontos.length > 3 ? ` e mais ${pontos.length - 3}` : '');
    const quantidade = pontos.length === 1 ? '1 ponto encontrado pelo nome' : `${pontos.length} pontos encontrados pelo nome`;
    mostrarAvisoBusca(`${quantidade}: ${lista}. Para buscar um endereço, digite a rua completa.`);
    return true;
}

function buscarEndereco(termo) {
    const botao = document.getElementById('btn-buscar-endereco');

    if (!termo) {
        mostrarAvisoBusca('Digite um endereço para buscar.', true);
        return;
    }

    if (mostrarPontosPorNome(termo)) return;

    botao.disabled = true;
    mostrarAvisoBusca('Buscando endereço...');

    fetch(`/api/geocodificar?q=${encodeURIComponent(termo)}`)
        .then(res => res.json())
        .then(data => {
            if (!data.sucesso) {
                limparDestaqueBusca();
                mostrarAvisoBusca('Endereço não encontrado em São Paulo. Confira o nome da rua ou acrescente o bairro.', true);
                return;
            }

            // O texto digitado passa a valer como endereço, então volta a mostrar todos os pontos
            buscaPorEndereco = true;
            const pontosVisiveis = filtrarPontos();
            renderizarPontos(pontosVisiveis);

            const latlng = L.latLng(data.latitude, data.longitude);
            const enquadramento = destacarEnderecoBuscado(latlng, data.endereco);

            const ordenados = ordenarPorDistancia(latlng, pontosVisiveis);
            const proximos = ordenados.filter(item => item.distancia <= RAIO_PONTOS_PROXIMOS).length;
            let textoProximos;

            if (proximos > 0) {
                textoProximos = `${proximos} ${proximos === 1 ? 'ponto de apoio' : 'pontos de apoio'} a até ${RAIO_PONTOS_PROXIMOS} m.`;
            } else if (ordenados.length > 0) {
                // Nenhum ponto no raio: indica o mais próximo e o inclui no enquadramento do mapa
                const maisProximo = ordenados[0];
                enquadramento.extend([maisProximo.ponto.latitude, maisProximo.ponto.longitude]);
                textoProximos = `Nenhum ponto de apoio a até ${RAIO_PONTOS_PROXIMOS} m. O mais próximo é ${maisProximo.ponto.nome}, a ${formatarDistancia(maisProximo.distancia)}.`;
            } else {
                textoProximos = 'Nenhum ponto de apoio atende aos filtros selecionados.';
            }

            map.fitBounds(enquadramento, { padding: [40, 40] });
            mostrarAvisoBusca(`Endereço encontrado: ${data.endereco}. ${textoProximos}`);

            // No celular, recolhe o menu para o resultado ficar visível no mapa
            if (window.innerWidth <= 768) {
                document.getElementById('sidebarPanel').classList.add('mobile-hidden');
            }
        })
        .catch(err => {
            console.error('Erro ao buscar endereço:', err);
            mostrarAvisoBusca('Não foi possível buscar o endereço agora. Tente novamente.', true);
        })
        .finally(() => {
            botao.disabled = false;
        });
}

function inicializarBusca() {
    const formBusca = document.getElementById('form-busca');
    const inputBusca = document.getElementById('input-busca');
    if (!formBusca || !inputBusca) return;

    // Ao digitar, volta a filtrar os pontos por nome ou endereço, como antes
    inputBusca.addEventListener('input', () => {
        buscaPorEndereco = false;
        limparDestaqueBusca();
        fecharAvisoBusca();
        aplicarFiltros();
    });

    formBusca.addEventListener('submit', (e) => {
        e.preventDefault();
        buscarEndereco(inputBusca.value.trim());
    });

    document.getElementById('btn-fechar-aviso-busca').addEventListener('click', fecharAvisoBusca);
}


// ==========================================
// 10. FORMULÁRIOS
// ==========================================

// Fluxo em duas etapas para novo ponto (coordenadas via clique no mapa)
function inicializarFluxoNovoPonto() {
    const latInput = document.getElementById('novo-lat');
    const lngInput = document.getElementById('novo-lng');
    const btnProximo = document.getElementById('btn-proximo-passo');
    const passo1Div = document.getElementById('novo-passo-1');
    const formPonto = document.getElementById('form-novo-ponto');
    const btnVoltar = document.getElementById('btn-voltar-passo-1');
    const textoDica = document.getElementById('texto-dica-mapa');

    if (textoDica) {
        const isMobile = window.innerWidth <= 768;
        textoDica.textContent = isMobile
            ? "Toque no mapa para inserir a localização do novo ponto de apoio."
            : "Clique no mapa para inserir a localização do novo ponto de apoio.";
    }

    map.on('click', function(e) {
        if (latInput && lngInput && btnProximo) {
            latInput.value = e.latlng.lat.toFixed(6);
            lngInput.value = e.latlng.lng.toFixed(6);

            btnProximo.removeAttribute('disabled');
            btnProximo.style.backgroundColor = '#2e7d32';
            btnProximo.style.cursor = 'pointer';
            btnProximo.style.opacity = '1';
        }
    });

    if (btnProximo && passo1Div && formPonto) {
        btnProximo.addEventListener('click', function(event) {
            event.preventDefault();
            if (!latInput.value || !lngInput.value) {
                alert('Por favor, selecione primeiro um local no mapa.');
                return;
            }
            passo1Div.style.display = 'none';
            formPonto.style.display = 'flex';
        });
    }

    if (btnVoltar && passo1Div && formPonto) {
        btnVoltar.addEventListener('click', function(event) {
            event.preventDefault();
            formPonto.style.display = 'none';
            passo1Div.style.display = 'block';
        });
    }
}

// Volta o fluxo de novo ponto ao passo 1, sem localização selecionada
function reiniciarFluxoNovoPonto() {
    const formPonto = document.getElementById('form-novo-ponto');
    const btnProximo = document.getElementById('btn-proximo-passo');

    formPonto.reset();
    formPonto.style.display = 'none';
    document.getElementById('novo-passo-1').style.display = 'block';
    document.getElementById('novo-lat').value = '';
    document.getElementById('novo-lng').value = '';

    btnProximo.setAttribute('disabled', '');
    btnProximo.style.backgroundColor = '#ccc';
    btnProximo.style.cursor = 'not-allowed';
}

// Submissão do formulário de novo ponto
function inicializarFormNovoPonto() {
    const formPonto = document.getElementById('form-novo-ponto');
    if (!formPonto) return;

    formPonto.addEventListener('submit', (e) => {
        e.preventDefault();
        const valor = id => document.getElementById(id).value;
        const marcado = id => document.getElementById(id).checked;
        const latitude = parseFloat(valor('novo-lat'));
        const longitude = parseFloat(valor('novo-lng'));

        const novoPonto = {
            nome: valor('novo-nome').trim(),
            tipo: valor('novo-tipo'),
            endereco: valor('novo-endereco').trim(),
            latitude: latitude,
            longitude: longitude,
            capacidade_vagas: parseInt(valor('novo-vagas')) || 0,
            gratuito: marcado('novo-gratuito'),
            coberto: marcado('novo-coberto'),
            seguranca: marcado('novo-seguranca')
        };

        fetch('/api/pontos/novo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoPonto)
        })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                alert('Ponto de apoio adicionado com sucesso!');
                reiniciarFluxoNovoPonto();
                mudarAba('explorar');

                // Recarrega os pontos, reaplica os filtros e mostra o novo ponto
                recarregarPontos().then(() => {
                    aplicarFiltros();
                    map.setView([latitude, longitude], 17);
                });
            } else {
                alert('Erro ao salvar: ' + data.mensagem);
            }
        })
        .catch(err => console.error('Erro ao salvar ponto:', err));
    });
}

// Submissão do formulário de edição
function inicializarFormEdicao() {
    const formEditar = document.getElementById('form-editar-ponto');
    if (!formEditar) return;

    formEditar.addEventListener('submit', (e) => {
        e.preventDefault();
        const idPonto = document.getElementById('edit-ponto-id').value;
        const marcado = id => document.getElementById(id).checked ? 1 : 0;

        const dadosAtualizados = {
            capacidade_vagas: parseInt(document.getElementById('edit-vagas').value) || 0,
            gratuito: marcado('edit-gratuito'),
            coberto: marcado('edit-coberto'),
            vigilancia_humana: marcado('edit-vigilancia'),
            cameras: marcado('edit-cameras')
        };

        fetch(`/api/pontos/${idPonto}/editar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                alert('Ponto de apoio atualizado com sucesso!');
                fecharModalEdicao();

                // Fecha o popup aberto para forçar a atualização visual imediata
                map.closePopup();

                // Recarrega os pontos e reaplica os filtros vigentes
                recarregarPontos().then(aplicarFiltros);
            } else {
                alert('Erro ao atualizar: ' + data.mensagem);
            }
        })
        .catch(err => console.error('Erro ao atualizar ponto:', err));
    });
}

// Formulário de ocorrências (contador de caracteres + envio via AJAX)
function inicializarFormOcorrencia() {
    const textareaDescricao = document.getElementById('ocorrencia-descricao');
    const contadorCaracteres = document.getElementById('contador-caracteres');

    if (textareaDescricao && contadorCaracteres) {
        textareaDescricao.addEventListener('input', () => {
            const atual = textareaDescricao.value.length;
            const max = textareaDescricao.getAttribute('maxlength') || 1000;
            contadorCaracteres.textContent = `${atual}/${max}`;
        });
    }

    const formOcorrencia = document.getElementById('form-ocorrencia');
    if (!formOcorrencia) return;

    formOcorrencia.addEventListener('submit', (e) => {
        e.preventDefault();
        const idPonto = document.getElementById('ocorrencia-ponto-id').value;
        const descricao = document.getElementById('ocorrencia-descricao').value;
        const tipo = document.getElementById('ocorrencia-tipo').value;

        fetch('/api/ocorrencias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_ponto: idPonto, descricao: descricao, tipo: tipo })
        })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                alert('Ocorrência registrada com sucesso!');
                fecharModalOcorrencia();

                recarregarPontos()
                    .then(renderizarPontos)
                    .catch(err => console.error('Erro ao recarregar pontos:', err));
            } else {
                alert('Erro ao registrar: ' + data.mensagem);
            }
        })
        .catch(err => console.error('Erro na requisição:', err));
    });
}


// ==========================================
// 11. INICIALIZAÇÃO
// ==========================================

// Aplicado antes de a página terminar de carregar, para não piscar no tamanho padrão
restaurarTamanhoFonte();
carregarClima();

document.addEventListener('DOMContentLoaded', () => {
    inicializarMapa();
    inicializarFiltros();
    inicializarBusca();
    inicializarFluxoNovoPonto();
    inicializarFormNovoPonto();
    inicializarFormEdicao();
    inicializarFormOcorrencia();
    inicializarMenuMobile();
    inicializarLegenda();
    inicializarTecladoModais();

    // Carrega os pontos iniciais do Backend Flask
    recarregarPontos()
        .then(renderizarPontos)
        .catch(err => console.error('Erro ao carregar dados:', err));
});
