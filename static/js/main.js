// Funções globais para os Modais de Ocorrências
function abrirModalOcorrencia(idPonto) {
    document.getElementById('ocorrencia-ponto-id').value = idPonto;
    document.getElementById('modal-ocorrencia').style.display = 'flex';
}

function fecharModalOcorrencia() {
    document.getElementById('modal-ocorrencia').style.display = 'none';
    document.getElementById('form-ocorrencia').reset();
    const contador = document.getElementById('contador-caracteres');
    if (contador) contador.textContent = '0/1000';
}

function abrirModalDetalhe(tipo, data, descricao) {
    document.getElementById('detalhe-tipo').textContent = tipo;
    document.getElementById('detalhe-data').textContent = data;
    document.getElementById('detalhe-descricao').textContent = descricao;
    document.getElementById('modal-detalhe-ocorrencia').style.display = 'flex';
}

function fecharModalDetalhe() {
    document.getElementById('modal-detalhe-ocorrencia').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o mapa Leaflet
    const map = L.map('map').setView([-23.55052, -46.633309], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const camadaMarcadores = L.layerGroup().addTo(map);
    let todosPontos = [];

    // 2. Função para criar o ícone L.divIcon com base no tipo e na última ocorrência
    function obterIconePersonalizado(tipo, ultimaOcorrencia) {
        let classeCor = 'pin-padrao';
        let iconeFa = 'fa-parking';

        if (tipo === 'Bicicletário') {
            classeCor = 'pin-bicicletario';
            iconeFa = 'fa-bicycle';
        } else if (tipo === 'Paraciclo') {
            classeCor = 'pin-paraciclo';
            iconeFa = 'fa-square-parking';
        } else if (tipo === 'Oficina / Suporte') {
            classeCor = 'pin-oficina';
            iconeFa = 'fa-wrench';
        }

        // Regra de cores de alerta para os pins
        if (ultimaOcorrencia) {
            if (
                ultimaOcorrencia === 'Ponto de Apoio Fechado' ||
                ultimaOcorrencia === 'Ponto de Apoio Lotado'
            ) {
                classeCor = 'pin-alerta-vermelho';
            } else if (
                ultimaOcorrencia === 'Vandalismo' ||
                ultimaOcorrencia === 'Avaria/Estrutura Danificada' ||
                ultimaOcorrencia === 'Ocorrência de Furto/Roubo'
            ) {
                classeCor = 'pin-alerta-amarelo';
            }
        }

        return L.divIcon({
            className: 'custom-pin-wrapper',
            html: `<div class="custom-pin ${classeCor}"><i class="fa-solid ${iconeFa}"></i></div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
            popupAnchor: [0, -34]
        });
    }

    // 3. Renderiza os pontos no mapa
    function renderizarPontos(pontos) {
        camadaMarcadores.clearLayers();

        pontos.forEach(ponto => {
            // Passa a última ocorrência do ponto para definir a cor correspondente do pin
            const icone = obterIconePersonalizado(ponto.tipo, ponto.ultima_ocorrencia_tipo);
            const marker = L.marker([ponto.latitude, ponto.longitude], { icon: icone });

            const idPonto = ponto.id_ponto || ponto.id;

            const popupHtml = `
                <div class="popup-content">
                    <span class="popup-tag">${ponto.tipo}</span>
                    <h3>${ponto.nome}</h3>
                    <p><i class="fa-solid fa-location-dot"></i> ${ponto.endereco}</p>
                    <p><i class="fa-solid fa-layer-group"></i> <strong>Vagas:</strong> ${ponto.capacidade_vagas || 'N/I'}</p>
                    <p><i class="fa-solid fa-shield-halved"></i> <strong>Coberto:</strong> ${ponto.coberto ? 'Sim' : 'Não'}</p>
                    <p><i class="fa-solid fa-tag"></i> <strong>Gratuito:</strong> ${ponto.gratuito ? 'Sim' : 'Não'}</p>
                    
                    <div class="popup-ocorrencias-container">
                        <h4>Últimas Ocorrências</h4>
                        <div id="lista-oc-${idPonto}" class="lista-ocorrencias-popup">
                            <span class="sem-ocorrencias">A carregar...</span>
                        </div>
                    </div>

                    <button class="btn-ocorrencia" onclick="abrirModalOcorrencia(${idPonto})">
                        <i class="fa-solid fa-triangle-exclamation"></i> Registar Ocorrência
                    </button>
                </div>
            `;

            marker.bindPopup(popupHtml);

            // Carrega dinamicamente as ocorrências quando o popup abre
            marker.on('popupopen', () => {
                fetch(`/api/pontos/${idPonto}/ocorrencias`)
                    .then(res => res.json())
                    .then(ocorrencias => {
                        const container = document.getElementById(`lista-oc-${idPonto}`);
                        if (!container) return;

                        if (!Array.isArray(ocorrencias) || ocorrencias.length === 0) {
                            container.innerHTML = '<span class="sem-ocorrencias">Não há ocorrências.</span>';
                            return;
                        }

                        let htmlOcorrencias = '';
                        ocorrencias.forEach(oc => {
                            const tipoEscapado = oc.tipo.replace(/'/g, "\\'");
                            const dataEscapada = oc.data_relato.replace(/'/g, "\\'");
                            const descEscapada = (oc.descricao || '').replace(/'/g, "\\'").replace(/\n/g, ' ');

                            htmlOcorrencias += `
                                <div class="item-ocorrencia-popup" onclick="abrirModalDetalhe('${tipoEscapado}', '${dataEscapada}', '${descEscapada}')">
                                    <span class="tipo"><i class="fa-solid fa-circle-exclamation"></i> ${oc.tipo}</span>
                                    <span class="data">${oc.data_relato}</span>
                                </div>
                            `;
                        });
                        container.innerHTML = htmlOcorrencias;
                    })
                    .catch(err => {
                        const container = document.getElementById(`lista-oc-${idPonto}`);
                        if (container) container.innerHTML = '<span class="sem-ocorrencias">Não há ocorrências.</span>';
                    });
            });

            camadaMarcadores.addLayer(marker);
        });

        document.getElementById('total-pontos').textContent = pontos.length;
    }

    // 4. Lógica de Filtros e Busca
    function aplicarFiltros() {
        const textoBusca = document.getElementById('input-busca').value.toLowerCase();
        const tipoSelecionado = document.getElementById('select-tipo').value;
        const apenasGratuito = document.getElementById('check-gratuito').checked;
        const apenasCoberto = document.getElementById('check-coberto').checked;

        const filtrados = todosPontos.filter(ponto => {
            const atendeTexto = ponto.nome.toLowerCase().includes(textoBusca) ||
                                ponto.endereco.toLowerCase().includes(textoBusca);

            const atendeTipo = tipoSelecionado === 'todos' || ponto.tipo === tipoSelecionado;
            const atendeGratuito = !apenasGratuito || ponto.gratuito === 1;
            const atendeCoberto = !apenasCoberto || ponto.coberto === 1;

            return atendeTexto && atendeTipo && atendeGratuito && atendeCoberto;
        });

        renderizarPontos(filtrados);
    }

    // Escutadores de Eventos nos Filtros
    document.getElementById('input-busca').addEventListener('input', aplicarFiltros);
    document.getElementById('select-tipo').addEventListener('change', aplicarFiltros);
    document.getElementById('check-gratuito').addEventListener('change', aplicarFiltros);
    document.getElementById('check-coberto').addEventListener('change', aplicarFiltros);

    // 5. Contador de caracteres para a descrição da ocorrência
    const textareaDescricao = document.getElementById('ocorrencia-descricao');
    const contadorCaracteres = document.getElementById('contador-caracteres');

    if (textareaDescricao && contadorCaracteres) {
        textareaDescricao.addEventListener('input', () => {
            const atual = textareaDescricao.value.length;
            const max = textareaDescricao.getAttribute('maxlength') || 1000;
            contadorCaracteres.textContent = `${atual}/${max}`;
        });
    }

    // 6. Manipulação do envio do formulário de ocorrências via AJAX
    const formOcorrencia = document.getElementById('form-ocorrencia');
    if (formOcorrencia) {
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
                    alert('Ocorrência registada com sucesso!');
                    fecharModalOcorrencia();

                    // RECARREGA OS PONTOS DO MAPA AUTOMATICAMENTE
                    fetch('/api/pontos')
                        .then(res => res.json())
                        .then(dados => {
                            todosPontos = dados;
                            renderizarPontos(todosPontos);
                        })
                        .catch(err => console.error('Erro ao recarregar pontos:', err));

                } else {
                    alert('Erro ao registar: ' + data.mensagem);
                }
            })
            .catch(err => console.error('Erro na requisição:', err));
        });
    }
    // 7. Carrega os pontos do Backend Flask
    fetch('/api/pontos')
        .then(res => res.json())
        .then(dados => {
            todosPontos = dados;
            renderizarPontos(todosPontos);
        })
        .catch(err => console.error('Erro ao carregar dados:', err));
});