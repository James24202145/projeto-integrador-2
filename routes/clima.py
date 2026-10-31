import requests
from flask import Blueprint, jsonify, request

from config import OPENWEATHER_API_KEY, LATITUDE_PADRAO, LONGITUDE_PADRAO

clima_bp = Blueprint('clima', __name__)

URL_OPENWEATHER = "https://api.openweathermap.org/data/2.5/weather"


@clima_bp.route('/api/clima', methods=['GET'])
def obter_clima():
    lat = request.args.get('lat', LATITUDE_PADRAO)
    lon = request.args.get('lon', LONGITUDE_PADRAO)

    url = f"{URL_OPENWEATHER}?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric&lang=pt_br"

    try:
        resposta = requests.get(url)
        dados = resposta.json()

        if resposta.status_code == 200:
            clima_info = {
                "temperatura": round(dados["main"]["temp"]),
                "descricao": dados["weather"][0]["description"],
                "icone": f"https://openweathermap.org/img/wn/{dados['weather'][0]['icon']}@2x.png"
            }
            return jsonify({"sucesso": True, "clima": clima_info}), 200
        else:
            return jsonify({"sucesso": False, "mensagem": dados.get("message", "Erro ao buscar clima")}), 400
    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500
