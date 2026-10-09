document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o Mapa em SP
    const map = L.map('map', { zoomControl: false }).setView([-23.55052, -46.633309], 13);

    // Reposiciona os controles de Zoom para o canto inferior direito
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Mapeamento TileLayer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    let todosOsPontos = [];
    const markersGroup = L.layerGroup().addTo(map);

    // Elementos da Interface
    const searchInput = document.getElementById('search-input');
    const filterTipo = document.getElementById('filter-tipo');
    const filterGratuito = document.getElementById('filter-gratuito');
    const filterCoberto = document.getElementById('filter-coberto');
    const pontoCount = document.getElementById('ponto-count');

    // 2. Busca os dados da API Flask
    fetch('/api/pontos')
        .then(res => res.json())
        .then(pontos => {
            todosOsPontos = pontos;
            renderizarPontos(todosOsPontos);
        })
        .catch(err => console.error('Erro ao carregar os pontos:', err));

    // 3. Função para Renderizar os Marcadores no Mapa
    function renderizarPontos(pontos) {
        markersGroup.clearLayers(); // Limpa marcadores anteriores

        pontos.forEach(ponto => {
            const marker = L.marker([ponto.latitude, ponto.longitude]);

            const popupContent = `
                <div style="font-size: 13px; min-width: 180px;">
                    <h3 style="margin-bottom: 6px; color: #1b5e20;">${ponto.nome}</h3>
                    <p><strong>Tipo:</strong> ${ponto.tipo}</p>
                    <p><strong>Endereço:</strong> ${ponto.endereco}</p>
                    <p><strong>Vagas:</strong> ${ponto.capacidade_vagas}</p>
                    <p><strong>Gratuito:</strong> ${ponto.gratuito ? 'Sim' : 'Não'}</p>
                    <p><strong>Coberto:</strong> ${ponto.coberto ? 'Sim' : 'Não'}</p>
                    <p><strong>Operador:</strong> ${ponto.operador || 'Não informado'}</p>
                </div>
            `;

            marker.bindPopup(popupContent);
            markersGroup.addLayer(marker);
        });

        pontoCount.textContent = pontos.length;
    }

    // 4. Lógica de Filtragem e Busca
    function aplicarFiltros() {
        const termoBusca = searchInput.value.toLowerCase();
        const tipoSelecionado = filterTipo.value;
        const apenasGratuito = filterGratuito.checked;
        const apenasCoberto = filterCoberto.checked;

        const pontosFiltrados = todosOsPontos.filter(ponto => {
            // Busca por Nome ou Endereço
            const atendeBusca = ponto.nome.toLowerCase().includes(termoBusca) ||
                                ponto.endereco.toLowerCase().includes(termoBusca);

            // Filtro por Tipo
            const atendeTipo = (tipoSelecionado === 'todos') || (ponto.tipo === tipoSelecionado);

            // Filtro por Gratuito / Coberto
            const atendeGratuito = !apenasGratuito || (ponto.gratuito === 1);
            const atendeCoberto = !apenasCoberto || (ponto.coberto === 1);

            return atendeBusca && atendeTipo && atendeGratuito && atendeCoberto;
        });

        renderizarPontos(pontosFiltrados);
    }

    // Event Listeners para acionar a filtragem
    searchInput.addEventListener('input', aplicarFiltros);
    filterTipo.addEventListener('change', aplicarFiltros);
    filterGratuito.addEventListener('change', aplicarFiltros);
    filterCoberto.addEventListener('change', aplicarFiltros);
});