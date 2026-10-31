from flask import Blueprint, jsonify, request

from config import ID_OPERADOR_PADRAO
from db import get_db_connection, fechar_conexao
from utils import agora_sp_formatado, limite_lotado

pontos_bp = Blueprint('pontos', __name__)


QUERY_LISTAR_PONTOS = """
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

QUERY_INSERIR_PONTO = """
    INSERT INTO ponto_apoio (nome, endereco, latitude, longitude, tipo, capacidade_vagas, gratuito, coberto, status_operacional, data_ultima_verificacao, id_operador)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Ativo', %s, %s);
"""

QUERY_INSERIR_SEGURANCA = """
    INSERT INTO seguranca (vigilancia_humana, cameras, seguro_contra_furto, nivel_avaliado, id_ponto)
    VALUES (%s, 0, 0, 0, %s);
"""

QUERY_ATUALIZAR_PONTO = """
    UPDATE ponto_apoio
    SET capacidade_vagas = %s,
        gratuito = %s,
        coberto = %s,
        data_ultima_verificacao = %s
    WHERE id_ponto = %s
"""

QUERY_ATUALIZAR_SEGURANCA = """
    UPDATE seguranca
    SET vigilancia_humana = %s,
        cameras = %s
    WHERE id_ponto = %s
"""


# Rota da API REST para listar os pontos de apoio
@pontos_bp.route('/api/pontos', methods=['GET'])
def get_pontos():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Erro ao conectar ao banco de dados'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute(QUERY_LISTAR_PONTOS, (limite_lotado(),))
        pontos = cursor.fetchall()

        for ponto in pontos:
            ponto['latitude'] = float(ponto['latitude'])
            ponto['longitude'] = float(ponto['longitude'])

        return jsonify(pontos), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        fechar_conexao(conn, cursor)


@pontos_bp.route('/api/pontos/novo', methods=['POST'])
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

        cursor.execute(QUERY_INSERIR_PONTO,
                       (nome, endereco, latitude, longitude, tipo, capacidade_vagas, gratuito, coberto,
                        agora_sp_formatado(), ID_OPERADOR_PADRAO))

        # Insere na tabela seguranca usando o valor obtido do checkbox para vigilancia_humana
        cursor.execute(QUERY_INSERIR_SEGURANCA, (vigilancia_humana, cursor.lastrowid))

        conn.commit()

        return jsonify({'sucesso': True, 'mensagem': 'Ponto de apoio adicionado com sucesso!'})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500

    finally:
        fechar_conexao(conn, cursor)


@pontos_bp.route('/api/pontos/<int:id_ponto>/editar', methods=['PUT'])
def editar_ponto(id_ponto):
    dados = request.get_json()

    capacidade_vagas = dados.get('capacidade_vagas', 0)
    gratuito = dados.get('gratuito', 0)
    coberto = dados.get('coberto', 0)
    vigilancia_humana = dados.get('vigilancia_humana', 0)
    cameras = dados.get('cameras', 0)
    data_atual = agora_sp_formatado()

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'sucesso': False, 'mensagem': 'Erro de conexão'}), 500

        cursor = conn.cursor()

        # 1. Atualiza tabela ponto_apoio e data_ultima_verificacao
        cursor.execute(QUERY_ATUALIZAR_PONTO, (capacidade_vagas, gratuito, coberto, data_atual, id_ponto))

        # 2. Atualiza tabela seguranca
        cursor.execute(QUERY_ATUALIZAR_SEGURANCA, (vigilancia_humana, cameras, id_ponto))

        conn.commit()

        return jsonify({'sucesso': True, 'mensagem': 'Ponto atualizado com sucesso!'})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500

    finally:
        fechar_conexao(conn, cursor)


# Rota para excluir ponto (e registros associados por cascata explícita)
@pontos_bp.route('/api/pontos/<int:id_ponto>', methods=['DELETE'])
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
        fechar_conexao(conn, cursor)
