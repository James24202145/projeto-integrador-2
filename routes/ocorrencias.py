from datetime import timedelta

from flask import Blueprint, jsonify, request

from config import DIAS_EVOLUCAO_OCORRENCIAS
from db import get_db_connection, fechar_conexao
from utils import agora_sp, agora_sp_formatado, limite_lotado

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

# As estatísticas consideram apenas os pontos ativos, os mesmos exibidos no mapa
QUERY_OCORRENCIAS_POR_TIPO = """
    SELECT oc.tipo, COUNT(*) AS total
    FROM ocorrencia oc
    JOIN ponto_apoio p ON p.id_ponto = oc.id_ponto
    WHERE p.status_operacional = 'Ativo'
    GROUP BY oc.tipo
    ORDER BY total DESC;
"""

QUERY_OCORRENCIAS_POR_DIA = """
    SELECT DATE(oc.data_relato) AS dia, COUNT(*) AS total
    FROM ocorrencia oc
    JOIN ponto_apoio p ON p.id_ponto = oc.id_ponto
    WHERE p.status_operacional = 'Ativo'
      AND oc.data_relato >= %s
    GROUP BY dia;
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


# Rota da API REST com os totais de ocorrências usados no painel estatístico
@ocorrencias_bp.route('/api/estatisticas/ocorrencias', methods=['GET'])
def get_estatisticas_ocorrencias():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'sucesso': False, 'mensagem': 'Erro de conexão com o banco de dados'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute(QUERY_OCORRENCIAS_POR_TIPO)
        por_tipo = cursor.fetchall()

        hoje = agora_sp().date()
        inicio = hoje - timedelta(days=DIAS_EVOLUCAO_OCORRENCIAS - 1)
        cursor.execute(QUERY_OCORRENCIAS_POR_DIA, (inicio,))
        totais_por_dia = {linha['dia']: linha['total'] for linha in cursor.fetchall()}

        # Dias sem relatos entram com zero para a linha do tempo ficar contínua
        por_dia = []
        for i in range(DIAS_EVOLUCAO_OCORRENCIAS):
            dia = inicio + timedelta(days=i)
            por_dia.append({'data': dia.strftime('%d/%m'), 'total': totais_por_dia.get(dia, 0)})

        return jsonify({
            'sucesso': True,
            'total': sum(linha['total'] for linha in por_tipo),
            'por_tipo': por_tipo,
            'por_dia': por_dia
        }), 200

    except Exception as e:
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500

    finally:
        fechar_conexao(conn, cursor)
