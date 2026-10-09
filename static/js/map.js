document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o mapa centralizado em São Paulo (coordenadas aproximadas)
    const map = L.map('map').setView([-23.55052, -46.633309], 12);

    // 2. Adiciona as camadas de mapa do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 3. Consome a API /api/pontos da nossa aplicação Flask
    fetch('/api/pontos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar os dados dos pontos de apoio');
            }
            return response.json();
        })
        .then(pontos => {
            pontos.forEach(ponto => {
                // Cria o marcador no mapa usando as coordenadas da base
                const marker = L.marker([ponto.latitude, ponto.longitude]).addTo(map);

                // Monta o balão de informação (Popup)
                const popupContent = `
                    <div style="font-size: 14px;">
                        <h3 style="margin-bottom: 5px; color: #2e7d32;">${ponto.nome}</h3>
                        <p><strong>Tipo:</strong> ${ponto.tipo}</p>
                        <p><strong>Endereço:</strong> ${ponto.endereco}</p>
                        <p><strong>Vagas:</strong> ${ponto.capacidade_vagas}</p>
                        <p><strong>Operador:</strong> ${ponto.operador || 'Não informado'}</p>
                        <p><strong>Gratuito:</strong> ${ponto.gratuito ? 'Sim' : 'Não'}</p>
                        <p><strong>Coberto:</strong> ${ponto.coberto ? 'Sim' : 'Não'}</p>
                    </div>
                `;

                marker.bindPopup(popupContent);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar dados do Ecomapa:', error);
        });
});