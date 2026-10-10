document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o mapa Leaflet
    const map = L.map('map').setView([-23.55052, -46.633309], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const camadaMarcadores = L.layerGroup().addTo(map);
    let todosPontos = [];

    // 2. Função para criar o ícone L.divIcon
    function obterIconePersonalizado(tipo) {
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
            const icone = obterIconePersonalizado(ponto.tipo);
            const marker = L.marker([ponto.latitude, ponto.longitude], { icon: icone });

            const popupHtml = `
                <div class="popup-content">
                    <span class="popup-tag">${ponto.tipo}</span>
                    <h3>${ponto.nome}</h3>
                    <p><i class="fa-solid fa-location-dot"></i> ${ponto.endereco}</p>
                    <p><i class="fa-solid fa-layer-group"></i> <strong>Vagas:</strong> ${ponto.capacidade_vagas || 'N/I'}</p>
                    <p><i class="fa-solid fa-shield-halved"></i> <strong>Coberto:</strong> ${ponto.coberto ? 'Sim' : 'Não'}</p>
                    <p><i class="fa-solid fa-tag"></i> <strong>Gratuito:</strong> ${ponto.gratuito ? 'Sim' : 'Não'}</p>
                </div>
            `;

            marker.bindPopup(popupHtml);
            camadaMarcadores.addLayer(marker);
        });

        // Atualiza o contador na interface
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

    // 5. Carrega os pontos do Backend Flask
    fetch('/api/pontos')
        .then(res => res.json())
        .then(dados => {
            todosPontos = dados;
            renderizarPontos(todosPontos);
        })
        .catch(err => console.error('Erro ao carregar dados:', err));
});