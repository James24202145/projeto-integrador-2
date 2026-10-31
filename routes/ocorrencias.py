from flask import Blueprint, jsonify, request

from db import get_db_connection, fechar_conexao
from utils import agora_sp_formatado, limite_lotado

ocorrencias_bp = Blueprint('ocorrencias', __name__)


QUERY_LISTAR_OCORRENCIAS_PONTO = """
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

QUERY_INSERIR_OCORRENCIA = """
    INSERT INTO ocorrencia (id_ponto, tipo, descricao, data_relato)
    VALUES (%s, %s, %s, %s);
"""


# Rota da API REST para listar ocorrências de um ponto específico
@ocorrencias_bp.route('/api/pontos/<int:id_ponto>/ocorrencias', methods=['GET'])
def get_ocorrencias_ponto(id_ponto):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Erro ao conectar ao banco de dados'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute(QUERY_LISTAR_OCORRENCIAS_PONTO, (id_ponto, limite_lotado()))
        ocorrencias = cursor.fetchall()

        for oc in ocorrencias:
            if oc.get('data_relato'):
                oc['data_relato'] = oc['data_relato'].strftime('%d/%m/%Y %H:%M')

        return jsonify(ocorrencias), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        fechar_conexao(conn, cursor)


# Rota da API REST para registrar ocorrências associadas a um ponto de apoio
@ocorrencias_bp.route('/api/ocorrencias', methods=['POST'])
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
        cursor.execute(QUERY_INSERIR_OCORRENCIA, (id_ponto, tipo, descricao, agora_sp_formatado()))
        conn.commit()

        return jsonify({'sucesso': True, 'mensagem': 'Ocorrência registrada com sucesso!'})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500

    finally:
        fechar_conexao(conn, cursor)
