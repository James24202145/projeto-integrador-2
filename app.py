from datetime import datetime
from flask import Flask, jsonify, render_template, request
from db import get_db_connection

app = Flask(__name__)


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

        # Atualizado para trazer o tipo de ocorrência mais severa ou recente associada
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
                        o.nome AS operador,
                        (
                            SELECT oc.tipo 
                            FROM ocorrencia oc 
                            WHERE oc.id_ponto = p.id_ponto 
                              AND (
                                  oc.tipo != 'Ponto de Apoio Lotado' 
                                  OR oc.data_relato >= NOW() - INTERVAL 3 HOUR
                              )
                            ORDER BY oc.data_relato DESC 
                            LIMIT 1
                        ) AS ultima_ocorrencia_tipo
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

        # Filtra para ocultar "Ponto de Apoio Lotado" com mais de 3 horas
        query = """
            SELECT id_ocorrencia, tipo, descricao, data_relato 
            FROM ocorrencia 
            WHERE id_ponto = %s 
              AND (
                  tipo != 'Ponto de Apoio Lotado' 
                  OR data_relato >= NOW() - INTERVAL 3 HOUR
              )
            ORDER BY data_relato DESC 
            LIMIT 5;
        """
        cursor.execute(query, (id_ponto,))
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

# Rota para apagar ponto
@app.route('/api/pontos/<int:id_ponto>', methods=['DELETE'])
def excluir_ponto(id_ponto):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Primeiro, remove todas as ocorrências associadas para evitar erro de chave estrangeira
        cursor.execute("DELETE FROM ocorrencia WHERE id_ponto = %s", (id_ponto,))

        # Em seguida, remove o ponto de apoio
        cursor.execute("DELETE FROM ponto_apoio WHERE id_ponto = %s", (id_ponto,))

        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Ponto e ocorrências associadas eliminados com sucesso!"})
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

    if not nome or not endereco or not latitude or not longitude or not tipo:
        return jsonify({'sucesso': False, 'mensagem': 'Preencha todos os campos obrigatórios.'}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'sucesso': False, 'mensagem': 'Erro de ligação à base de dados'}), 500

        cursor = conn.cursor()

        data_atual = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        query = """
            INSERT INTO ponto_apoio (nome, endereco, latitude, longitude, tipo, capacidade_vagas, gratuito, coberto, status_operacional, data_ultima_verificacao, id_operador) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Ativo', %s, %s);
        """
        # AQUI: Substitua o 'None' por '10' no final da tupla abaixo:
        cursor.execute(query,
                       (nome, endereco, latitude, longitude, tipo, capacidade_vagas, gratuito, coberto, data_atual, 10))
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