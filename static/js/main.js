// ==========================================
// 1. ESTADO GLOBAL E CONSTANTES
// ==========================================

// Lista de pontos carregada da API
let todosPontos = [];

// Instância do Chart.js (permite destruir/recriar o gráfico)
let meuGrafico = null;

// Mapa Leaflet e camada onde os marcadores são desenhados
let map = null;
let camadaMarcadores = null;

const CENTRO_SP = [-23.55052, -46.633309];

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


// ==========================================
// 2. UTILITÁRIOS
// ==========================================

// Os campos booleanos chegam do MySQL como 0/1
function ehVerdadeiro(valor) {
    return valor === 1 || valor === true;
}

function exibirModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function ocultarModal(id) {
    document.getElementById(id).style.display = 'none';
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

// Ajusta o tamanho da fonte
function mudarTamanhoFonte(tamanho) {
    const body = document.body;

    body.classList.remove('font-large', 'font-xlarge');

    if (tamanho === 'grande') {
        body.classList.add('font-large');
    } else if (tamanho === 'muito-grande') {
        body.classList.add('font-xlarge');
    }
}

// Alterna entre Modo Claro e Modo Escuro
function alternarTema() {
    const iconeTema = document.getElementById('icone-tema');

    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    if (iconeTema) iconeTema.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// Alterna entre as abas do painel lateral
function mudarAba(aba) {
    const abaExplorar = document.getElementById('aba-explorar');
    const abaAdicionar = document.getElementById('aba-adicionar');
    const botoes = document.querySelectorAll('.tab-btn');
    const explorar = aba === 'explorar';

    botoes.forEach(btn => btn.classList.remove('active'));

    if (abaExplorar) abaExplorar.style.display = explorar ? 'flex' : 'none';
    if (abaAdicionar) abaAdicionar.style.display = explorar ? 'none' : 'flex';

    const botaoAtivo = botoes[explorar ? 0 : 1];
    if (botaoAtivo) botaoAtivo.classList.add('active');
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
        toggleBtn.addEventListener('click', () => sidebar.classList.remove('mobile-hidden'));
        closeBtn.addEventListener('click', () => sidebar.classList.add('mobile-hidden'));
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
        modal.style.display = 'flex';
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

function desenharGrafico(tipoGrafico, labels, dataset, titulo) {
    const ctx = document.getElementById('meuGraficoChart').getContext('2d');

    meuGrafico = new Chart(ctx, {
        type: tipoGrafico,
        data: { labels: labels, datasets: [dataset] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { title: { display: true, text: titulo } }
        }
    });
}

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

// Exemplo demonstrativo para os gráficos baseados em ocorrências
function graficoOcorrencias(titulo) {
    desenharGrafico('bar', ['Vandalismo', 'Lotado', 'Avaria Estrutural', 'Furto/Roubo', 'Fechado'], {
        label: 'Ocorrências Registradas',
        data: [2, 5, 3, 1, 4],
        backgroundColor: '#e65100'
    }, titulo);
}

const GRAFICOS = {
    infraestrutura: graficoInfraestrutura,
    gratuidade: graficoGratuidade,
    seguranca: graficoSeguranca,
    vagas: graficoVagas,
    ocorrencias_tipo: () => graficoOcorrencias('Incidência por Tipo de Ocorrência'),
    ocorrencias_tempo: () => graficoOcorrencias('Evolução Temporal dos Relatos')
};

function carregarGrafico(tipo, elementoBotao) {
    if (elementoBotao) {
        document.querySelectorAll('.btn-aba-grafico').forEach(btn => btn.classList.remove('active'));
        elementoBotao.classList.add('active');
    }

    if (meuGrafico) {
        meuGrafico.destroy();
    }

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
    map = L.map('map').setView(CENTRO_SP, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    camadaMarcadores = L.layerGroup().addTo(map);
}

// Cria o ícone L.divIcon com base no tipo e na última ocorrência
function obterIconePersonalizado(tipo, ultimaOcorrencia) {
    const estilo = ESTILO_PIN_POR_TIPO[tipo] || ESTILO_PIN_PADRAO;
    let classeCor = estilo.classeCor;

    if (OCORRENCIAS_ALERTA_VERMELHO.includes(ultimaOcorrencia)) {
        classeCor = 'pin-alerta-vermelho';
    } else if (OCORRENCIAS_ALERTA_AMARELO.includes(ultimaOcorrencia)) {
        classeCor = 'pin-alerta-amarelo';
    }

    return L.divIcon({
        className: 'custom-pin-wrapper',
        html: `<div class="custom-pin ${classeCor}"><i class="fa-solid ${estilo.iconeFa}"></i></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    });
}

function montarPopupHtml(ponto, idPonto) {
    return `
        <div class="popup-content">
            <span class="popup-tag">${ponto.tipo}</span>

            <!-- Cabeçalho com Título e Botão de Rota do Google Maps -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
                <h3 style="margin: 0; flex: 1;">${ponto.nome}</h3>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${ponto.latitude},${ponto.longitude}&travelmode=bicycling"
                   target="_blank"
                   title="Traçar rota de bicicleta no Google Maps"
                   style="background-color: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 14px; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <i class="fa-solid fa-person-biking"></i>
                </a>
            </div>
            <!-- Ações: Editar e Excluir lado a lado -->
            <div style="display: flex; gap: 12px; margin-bottom: 8px;">
                <button onclick="abrirModalEdicao(${idPonto})" style="background: none; border: none; color: #0288d1; font-size: 11px; font-weight: 600; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-pen-to-square"></i> Editar Ponto
                </button>
                <button onclick="excluirPonto(${idPonto})" style="background: none; border: none; color: #d32f2f; font-size: 11px; font-weight: 600; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-trash-can"></i> Excluir Ponto
                </button>
            </div>

            <p><i class="fa-solid fa-location-dot"></i> ${ponto.endereco}</p>
            <p><i class="fa-solid fa-shield"></i> <strong>Segurança:</strong> ${ponto.seguranca_geral ? 'Sim' : 'Não'}</p>
            <p><i class="fa-solid fa-layer-group"></i> <strong>Vagas:</strong> ${ponto.capacidade_vagas || 'N/I'}</p>
            <p><i class="fa-solid fa-shield-halved"></i> <strong>Coberto:</strong> ${ponto.coberto ? 'Sim' : 'Não'}</p>
            <p><i class="fa-solid fa-tag"></i> <strong>Gratuito:</strong> ${ponto.gratuito ? 'Sim' : 'Não'}</p>

            <div class="popup-ocorrencias-container">
                <h4>Últimas Ocorrências</h4>
                <div id="lista-oc-${idPonto}" class="lista-ocorrencias-popup">
                    <span class="sem-ocorrencias">Carregando...</span>
                </div>
            </div>

            <button class="btn-ocorrencia" onclick="abrirModalOcorrencia(${idPonto})">
                <i class="fa-solid fa-triangle-exclamation"></i> Registrar Ocorrência
            </button>
        </div>
    `;
}

function montarItemOcorrenciaHtml(oc) {
    const tipoEscapado = oc.tipo.replace(/'/g, "\\'");
    const dataEscapada = oc.data_relato.replace(/'/g, "\\'");
    const descEscapada = (oc.descricao || '').replace(/'/g, "\\'").replace(/\n/g, ' ');

    return `
        <div class="item-ocorrencia-popup" onclick="abrirModalDetalhe('${tipoEscapado}', '${dataEscapada}', '${descEscapada}')">
            <span class="tipo"><i class="fa-solid fa-circle-exclamation"></i> ${oc.tipo}</span>
            <span class="data">${oc.data_relato}</span>
        </div>
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

    pontos.forEach(ponto => {
        const icone = obterIconePersonalizado(ponto.tipo, ponto.ultima_ocorrencia_tipo);
        const marker = L.marker([ponto.latitude, ponto.longitude], { icon: icone });
        const idPonto = ponto.id_ponto || ponto.id;

        marker.bindPopup(montarPopupHtml(ponto, idPonto));
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

function aplicarFiltros() {
    const textoBusca = document.getElementById('input-busca').value.toLowerCase();
    const tipoSelecionado = document.getElementById('select-tipo').value;
    const apenasGratuito = document.getElementById('check-gratuito').checked;
    const apenasCoberto = document.getElementById('check-coberto').checked;
    const apenasSeguranca = document.getElementById('check-seguranca').checked;

    const filtrados = todosPontos.filter(ponto => {
        const atendeTexto = ponto.nome.toLowerCase().includes(textoBusca) ||
                            ponto.endereco.toLowerCase().includes(textoBusca);

        const atendeTipo = tipoSelecionado === 'todos' || ponto.tipo === tipoSelecionado;
        const atendeGratuito = !apenasGratuito || ehVerdadeiro(ponto.gratuito);
        const atendeCoberto = !apenasCoberto || ehVerdadeiro(ponto.coberto);
        const atendeSeguranca = !apenasSeguranca || ehVerdadeiro(ponto.seguranca) || ehVerdadeiro(ponto.seguranca_geral);

        return atendeTexto && atendeTipo && atendeGratuito && atendeCoberto && atendeSeguranca;
    });

    renderizarPontos(filtrados);
}

function inicializarFiltros() {
    const campos = [
        ['input-busca', 'input'],
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
// 9. FORMULÁRIOS
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
// 10. INICIALIZAÇÃO
// ==========================================

carregarClima();

document.addEventListener('DOMContentLoaded', () => {
    inicializarMapa();
    inicializarFiltros();
    inicializarFluxoNovoPonto();
    inicializarFormEdicao();
    inicializarFormOcorrencia();
    inicializarMenuMobile();

    // Carrega os pontos iniciais do Backend Flask
    recarregarPontos()
        .then(renderizarPontos)
        .catch(err => console.error('Erro ao carregar dados:', err));
});
