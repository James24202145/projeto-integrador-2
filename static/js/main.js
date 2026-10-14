// Função global para alternar entre as abas do painel lateral
function mudarAba(aba) {
    const abaExplorar = document.getElementById('aba-explorar');
    const abaAdicionar = document.getElementById('aba-adicionar');
    const botoes = document.querySelectorAll('.tab-btn');

    botoes.forEach(btn => btn.classList.remove('active'));

    if (aba === 'explorar') {
        if (abaExplorar) abaExplorar.style.display = 'flex';
        if (abaAdicionar) abaAdicionar.style.display = 'none';
        if (botoes[0]) botoes[0].classList.add('active');
    } else {
        if (abaExplorar) abaExplorar.style.display = 'none';
        if (abaAdicionar) abaAdicionar.style.display = 'flex';
        if (botoes[1]) botoes[1].classList.add('active');
    }
}

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

    // Função de exclusão de ponto integrada no mesmo escopo para aceder a 'map' e 'renderizarPontos'
    window.excluirPonto = function(idPonto) {
        if (confirm('Tem certeza de que deseja eliminar este ponto de apoio? Todos os registos e ocorrências associados serão removidos permanentemente.')) {
            fetch(`/api/pontos/${idPonto}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) {
                    // Fecha o popup aberto imediatamente
                    map.closePopup();

                    alert('Ponto eliminado com sucesso!');

                    // Recarrega os pontos no mapa para o ponto sumir de imediato sem F5
                    fetch('/api/pontos')
                        .then(res => res.json())
                        .then(dados => {
                            todosPontos = dados;
                            renderizarPontos(todosPontos);
                        });
                } else {
                    alert('Erro ao eliminar: ' + data.mensagem);
                }
            })
            .catch(err => console.error('Erro na requisição:', err));
        }
    };

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
            const icone = obterIconePersonalizado(ponto.tipo, ponto.ultima_ocorrencia_tipo);
            const marker = L.marker([ponto.latitude, ponto.longitude], { icon: icone });

            const idPonto = ponto.id_ponto || ponto.id;
            const popupHtml = `
                <div class="popup-content">
                    <span class="popup-tag">${ponto.tipo}</span>
                    <h3>${ponto.nome}</h3>
                    
                    <!-- Botão Excluir logo abaixo do título -->
                    <button onclick="excluirPonto(${idPonto})" style="background: none; border: none; color: #d32f2f; font-size: 11px; font-weight: 600; cursor: pointer; padding: 0; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-trash-can"></i> Excluir Ponto
                    </button>

                    <p><i class="fa-solid fa-location-dot"></i> ${ponto.endereco}</p>
                    
                    <!-- Nova linha de Segurança -->
                    <p><i class="fa-solid fa-shield"></i> <strong>Segurança:</strong> ${ponto.seguranca_geral ? 'Sim' : 'Não'}</p>
                    
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
                    .catch(() => {
                        const container = document.getElementById(`lista-oc-${idPonto}`);
                        if (container) container.innerHTML = '<span class="sem-ocorrencias">Não há ocorrências.</span>';
                    });
            });

            camadaMarcadores.addLayer(marker);
        });

        const totalEl = document.getElementById('total-pontos');
        if (totalEl) totalEl.textContent = pontos.length;
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

    const inputBusca = document.getElementById('input-busca');
    const selectTipo = document.getElementById('select-tipo');
    const checkGratuito = document.getElementById('check-gratuito');
    const checkCoberto = document.getElementById('check-coberto');

    if (inputBusca) inputBusca.addEventListener('input', aplicarFiltros);
    if (selectTipo) selectTipo.addEventListener('change', aplicarFiltros);
    if (checkGratuito) checkGratuito.addEventListener('change', aplicarFiltros);
    if (checkCoberto) checkCoberto.addEventListener('change', aplicarFiltros);

    // 5. Fluxo em Duas Etapas para Novo Ponto (Coordenadas via clique no mapa)
    const latInput = document.getElementById('novo-lat');
    const lngInput = document.getElementById('novo-lng');
    const btnProximo = document.getElementById('btn-proximo-passo');
    const passo1Div = document.getElementById('novo-passo-1');
    const formPonto = document.getElementById('form-novo-ponto');
    const btnVoltar = document.getElementById('btn-voltar-passo-1');
    const sidebar = document.getElementById('sidebarPanel');
    const toggleBtn = document.getElementById('toggleMenuBtn');
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

    // 6. Submissão do novo ponto de apoio via AJAX
    if (formPonto) {
        formPonto.addEventListener('submit', (e) => {
            e.preventDefault();
            const dadosPonto = {
                nome: document.getElementById('novo-nome').value,
                tipo: document.getElementById('novo-tipo').value,
                endereco: document.getElementById('novo-endereco').value,
                latitude: parseFloat(latInput.value),
                longitude: parseFloat(lngInput.value),
                capacidade_vagas: parseInt(document.getElementById('novo-vagas').value) || 0,
                gratuito: document.getElementById('novo-gratuito').checked,
                coberto: document.getElementById('novo-coberto').checked,
                seguranca: document.getElementById('novo-seguranca').checked // <-- Adicionado aqui
            };

            fetch('/api/pontos/novo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPonto)
            })
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Ponto de apoio adicionado com sucesso!');
                    formPonto.reset();
                    passo1Div.style.display = 'block';
                    formPonto.style.display = 'none';
                    btnProximo.setAttribute('disabled', 'true');
                    btnProximo.style.backgroundColor = '#ccc';
                    btnProximo.style.cursor = 'not-allowed';
                    mudarAba('explorar');

                    fetch('/api/pontos')
                        .then(res => res.json())
                        .then(dados => {
                            todosPontos = dados;
                            renderizarPontos(todosPontos);
                        });
                } else {
                    alert('Erro ao adicionar: ' + data.mensagem);
                }
            })
            .catch(err => console.error('Erro na requisição:', err));
        });
    }

    // 7. Contador de caracteres para a descrição da ocorrência
    const textareaDescricao = document.getElementById('ocorrencia-descricao');
    const contadorCaracteres = document.getElementById('contador-caracteres');

    if (textareaDescricao && contadorCaracteres) {
        textareaDescricao.addEventListener('input', () => {
            const atual = textareaDescricao.value.length;
            const max = textareaDescricao.getAttribute('maxlength') || 1000;
            contadorCaracteres.textContent = `${atual}/${max}`;
        });
    }

    // 8. Manipulação do envio do formulário de ocorrências via AJAX
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

    // 9. Carrega os pontos iniciais do Backend Flask
    fetch('/api/pontos')
        .then(res => res.json())
        .then(dados => {
            todosPontos = dados;
            renderizarPontos(todosPontos);
        })
        .catch(err => console.error('Erro ao carregar dados:', err));
});