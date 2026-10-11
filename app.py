from datetime import datetime
from flask import Flask, jsonify, render_template, request
from db import get_db_connection

app = Flask(__name__)


# app.config['JSON_AS_ASCII'] = False


# Rota da página web (Front-end com Leaflet.js)
@app.route('/')
def index():
    return render_template('index.html')


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
                o.nome AS operador
            FROM ponto_apoio p
            LEFT JOIN operador o ON p.id_operador = o.id_operador
            WHERE p.status_operacional = 'Ativo';
        """
        cursor.execute(query)
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


# Rota da API REST para registar ocorrências associadas a um ponto de apoio
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
            return jsonify({'sucesso': False, 'mensagem': 'Erro de ligação à base de dados'}), 500

        cursor = conn.cursor()

        # Gera a data e hora do momento do registo
        data_relato = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        query = """
            INSERT INTO ocorrencia (id_ponto, tipo, descricao, data_relato) 
            VALUES (%s, %s, %s, %s);
        """
        cursor.execute(query, (id_ponto, tipo, descricao, data_relato))
        conn.commit()

        return jsonify({'sucesso': True, 'mensagem': 'Ocorrência registada com sucesso!'})

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