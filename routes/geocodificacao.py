import requests
from flask import Blueprint, jsonify, request

from config import URL_NOMINATIM_BUSCA, USER_AGENT_NOMINATIM, LIMITES_SAO_PAULO

geocodificacao_bp = Blueprint('geocodificacao', __name__)


def resumir_endereco(resultado):
    """Monta um endereço curto (rua, número e bairro) a partir da resposta do Nominatim."""
    partes = resultado.get('address', {})
    rua = partes.get('road') or resultado.get('name')
    numero = partes.get('house_number')
    bairro = partes.get('suburb') or partes.get('neighbourhood') or partes.get('city_district')

    if not rua:
        return ', '.join(resultado.get('display_name', '').split(', ')[:3])

    endereco = f"{rua}, {numero}" if numero else rua
    return f"{endereco} - {bairro}" if bairro else endereco


# Rota da API REST para converter um endereço digitado em coordenadas
@geocodificacao_bp.route('/api/geocodificar', methods=['GET'])
def geocodificar():
    termo = request.args.get('q', '').strip()
    if not termo:
        return jsonify({'sucesso': False, 'mensagem': 'Digite um endereço para buscar.'}), 400

    # Indicar a cidade evita que o Nominatim priorize ruas homônimas da região metropolitana
    if 'são paulo' not in termo.lower() and 'sao paulo' not in termo.lower():
        termo = f"{termo}, São Paulo, SP"

    parametros = {
        'q': termo,
        'format': 'jsonv2',
        'addressdetails': 1,
        'countrycodes': 'br',
        'viewbox': LIMITES_SAO_PAULO,
        'bounded': 1,
        'limit': 5,
        'accept-language': 'pt-BR'
    }

    try:
        resposta = requests.get(URL_NOMINATIM_BUSCA, params=parametros,
                                headers={'User-Agent': USER_AGENT_NOMINATIM}, timeout=10)
        resultados = resposta.json()

        if resposta.status_code != 200:
            return jsonify({'sucesso': False, 'mensagem': 'Serviço de busca indisponível.'}), 502

        # O retângulo de busca inclui cidades vizinhas; fica só com o município de São Paulo
        no_municipio = [r for r in resultados if r.get('address', {}).get('city') == 'São Paulo']
        if not no_municipio:
            return jsonify({'sucesso': False, 'mensagem': 'Endereço não encontrado em São Paulo.'}), 404

        resultado = no_municipio[0]
        return jsonify({
            'sucesso': True,
            'endereco': resumir_endereco(resultado),
            'latitude': float(resultado['lat']),
            'longitude': float(resultado['lon'])
        }), 200

    except Exception as e:
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500
