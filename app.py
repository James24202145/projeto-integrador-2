from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from flask import Flask, jsonify, render_template, request
from db import get_db_connection

app = Flask(__name__)

# Fuso horário da aplicação. Todas as datas são geradas aqui, no Python,
# e nunca pelo relógio do MySQL (NOW()), que no Cloud SQL costuma estar em UTC.
FUSO_SP = ZoneInfo("America/Sao_Paulo")

# Tempo durante o qual uma ocorrência "Ponto de Apoio Lotado" continua valendo
JANELA_LOTADO = timedelta(hours=3)


def agora_sp():
    """Data e hora atuais de São Paulo, sem informação de fuso (formato do DATETIME do MySQL)."""
    return datetime.now(FUSO_SP).replace(tzinfo=None)


def limite_lotado():
    """Ocorrências de lotação anteriores a este momento são ignoradas."""
    return agora_sp() - JANELA_LOTADO


# Rota da página web (Front-end com Leaflet.js)
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/pontos/<int:id_ponto>/editar', methods=['PUT'])
def editar_ponto(id_ponto):
    dados = request.get_json()

    capacidade_vagas = dados.get('capacidade_vagas', 0)
    gratuito = dados.get('gratuito', 0)
    coberto = dados.get('coberto', 0)
    vigilancia_humana = dados.get('vigilancia_humana', 0)
    cameras = dados.get('cameras', 0)
    data_atual = agora_sp().strftime('%Y-%m-%d %H:%M:%S')

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'sucesso': False, 'mensagem': 'Erro de conexão'}), 500

        cursor = conn.cursor()

        # 1. Atualiza tabela ponto_apoio e data_ultima_verificacao
        query_ponto = """
            UPDATE ponto_apoio 
            SET capacidade_vagas = %s, 
                gratuito = %s, 
                coberto = %s, 
                data_ultima_verificacao = %s 
            WHERE id_ponto = %s
        """
        cursor.execute(query_ponto, (capacidade_vagas, gratuito, coberto, data_atual, id_ponto))

        # 2. Atualiza tabela seguranca
        query_seguranca = """
            UPDATE seguranca 
            SET vigilancia_humana = %s, 
                cameras = %s 
            WHERE id_ponto = %s
        """
        cursor.execute(query_seguranca, (vigilancia_humana, cameras, id_ponto))

        conn.commit()

        return jsonify({'sucesso': True, 'mensagem': 'Ponto atualizado com sucesso!'})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Rota da API REST para listar os pontos de apoio
@app.route('/api/pontos', methods=['GET'])
def get_pontos():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Erro ao conectar ao banco de dados'}), 500

        cursor = conn.cursor(dictionary=True)

        # Em app.py -> rota get_pontos()
        query = """
            SELECT 
                p.id_ponto,
                p.nome,
                p.endereco,
                p.latitude,
                p.longitude,
                p.tipo,
                p.capacidade_vagas,
                p.gratuito,
                p.coberto,
                p.status_operacional,
                COALESCE(MAX(s.vigilancia_humana), 0) AS vigilancia_humana,
                COALESCE(MAX(s.cameras), 0) AS cameras,
                o.nome AS operador,
                CASE 
                    WHEN (
                        COALESCE(MAX(s.vigilancia_humana), 0) = 1 
                        OR COALESCE(MAX(s.cameras), 0) = 1 
                        OR COALESCE(MAX(s.seguro_contra_furto), 0) = 1
                    ) THEN 1 
                    ELSE 0 
                END AS seguranca_geral,
                (
                    SELECT oc.tipo 
                    FROM ocorrencia oc 
                    WHERE oc.id_ponto = p.id_ponto 
                      AND (
                          oc.tipo != 'Ponto de Apoio Lotado' 
                          OR oc.data_relato >= %s
                      )
                    ORDER BY oc.data_relato DESC 
                    LIMIT 1
                ) AS ultima_ocorrencia_tipo
            FROM ponto_apoio p
            LEFT JOIN operador o ON p.id_operador = o.id_operador
            LEFT JOIN seguranca s ON p.id_ponto = s.id_ponto
            WHERE p.status_operacional = 'Ativo'
            GROUP BY p.id_ponto;
        """

        cursor.execute(query, (limite_lotado(),))
        pontos = cursor.fetchall()

        for ponto in pontos:
            ponto['latitude'] = float(ponto['latitude'])
            ponto['longitude'] = float(ponto['longitude'])

        return jsonify(pontos), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# Rota da API REST para listar ocorrências de um ponto específico
@app.route('/api/pontos/<int:id_ponto>/ocorrencias', methods=['GET'])
def get_ocorrencias_ponto(id_ponto):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Erro ao conectar ao banco de dados'}), 500

        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT id_ocorrencia, tipo, descricao, data_relato 
            FROM ocorrencia 
            WHERE id_ponto = %s 
              AND (
                  tipo != 'Ponto de Apoio Lotado' 
                  OR data_relato >= %s
              )
            ORDER BY data_relato DESC 
            LIMIT 5;
        """
        cursor.execute(query, (id_ponto, limite_lotado()))
        ocorrencias = cursor.fetchall()

        for oc in ocorrencias:
            if oc.get('data_relato'):
                oc['data_relato'] = oc['data_relato'].strftime('%d/%m/%Y %H:%M')

        return jsonify(ocorrencias), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# Rota para excluir ponto (e registros associados por cascata explícita)
@app.route('/api/pontos/<int:id_ponto>', methods=['DELETE'])
def excluir_ponto(id_ponto):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Primeiro, remove os registros de segurança associados
        cursor.execute("DELETE FROM seguranca WHERE id_ponto = %s", (id_ponto,))

        # Remove todas as ocorrências associadas
        cursor.execute("DELETE FROM ocorrencia WHERE id_ponto = %s", (id_ponto,))

        # Em seguida, remove o ponto de apoio
        cursor.execute("DELETE FROM ponto_apoio WHERE id_ponto = %s", (id_ponto,))

        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Ponto e registros associados excluídos com sucesso!"})
    except Exception as e:
        conn.rollback()
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/pontos/novo', methods=['POST'])
def criar_ponto():
    dados = request.get_json()
    nome = dados.get('nome')
    endereco = dados.get('endereco')
    latitude = dados.get('latitude')
    longitude = dados.get('longitude')
    tipo = dados.get('tipo')
    capacidade_vagas = dados.get('capacidade_vagas', 0)
    gratuito = 1 if dados.get('gratuito') else 0
    coberto = 1 if dados.get('coberto') else 0

    # Captura se o checkbox de segurança foi marcado (1 para Sim, 0 para Não)
    vigilancia_humana = 1 if dados.get('seguranca') else 0

    if not nome or not endereco or not latitude or not longitude or not tipo:
        return jsonify({'sucesso': False, 'mensagem': 'Preencha todos os campos obrigatórios.'}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'sucesso': False, 'mensagem': 'Erro de conexão com o banco de dados'}), 500

        cursor = conn.cursor()

        data_atual = agora_sp().strftime('%Y-%m-%d %H:%M:%S')

        query_ponto = """
            INSERT INTO ponto_apoio (nome, endereco, latitude, longitude, tipo, capacidade_vagas, gratuito, coberto, status_operacional, data_ultima_verificacao, id_operador) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Ativo', %s, %s);
        """
        cursor.execute(query_ponto,
                       (nome, endereco, latitude, longitude, tipo, capacidade_vagas, gratuito, coberto, data_atual, 10))

        id_novo_ponto = cursor.lastrowid

        # Insere na tabela seguranca usando o valor obtido do checkbox para vigilancia_humana
        query_seguranca = """
            INSERT INTO seguranca (vigilancia_humana, cameras, seguro_contra_furto, nivel_avaliado, id_ponto)
            VALUES (%s, 0, 0, 0, %s);
        """
        cursor.execute(query_seguranca, (vigilancia_humana, id_novo_ponto))

        conn.commit()

        return jsonify({'sucesso': True, 'mensagem': 'Ponto de apoio adicionado com sucesso!'})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


import requests


@app.route('/api/clima', methods=['GET'])
def obter_clima():
    # Coordenadas padrão centradas em São Paulo / Região Metropolitana
    lat = request.args.get('lat', '-23.55052')
    lon = request.args.get('lon', '-46.633309')
    api_key = 'f27d45582eaeeb85404d750ff50aeca5'  # Coloque aqui a sua chave do OpenWeatherMap

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric&lang=pt_br"

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

# Rota da API REST para registrar ocorrências associadas a um ponto de apoio
@app.route('/api/ocorrencias', methods=['POST'])
def criar_ocorrencia():
    dados = request.get_json()
    id_ponto = dados.get('id_ponto')
    descricao = dados.get('descricao')
    tipo = dados.get('tipo', 'Outro')

    if not id_ponto or not descricao:
        return jsonify({'sucesso': False, 'mensagem': 'ID do ponto e descrição são obrigatórios.'}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'sucesso': False, 'mensagem': 'Erro de conexão com o banco de dados'}), 500

        cursor = conn.cursor()

        data_relato = agora_sp().strftime('%Y-%m-%d %H:%M:%S')

        query = """
            INSERT INTO ocorrencia (id_ponto, tipo, descricao, data_relato) 
            VALUES (%s, %s, %s, %s);
        """
        cursor.execute(query, (id_ponto, tipo, descricao, data_relato))
        conn.commit()

        return jsonify({'sucesso': True, 'mensagem': 'Ocorrência registrada com sucesso!'})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


if __name__ == '__main__':
    app.run(debug=True)