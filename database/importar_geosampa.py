import json
import os
import sys
import time
import requests
from datetime import date
from pyproj import Transformer

# Adiciona o diretório raiz ao path para importar o db.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from db import get_db_connection


def buscar_endereco_reverso(latitude, longitude):
    """Consulta a API do Nominatim (OpenStreetMap) para obter o endereço formatado."""
    url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={latitude}&lon={longitude}"
    headers = {'User-Agent': 'Ecomapa-Projeto-PI2-SP'}

    try:
        resposta = requests.get(url, headers=headers, timeout=10)
        if resposta.status_code == 200:
            dados = resposta.json()
            return dados.get('display_name', 'Endereço não disponível')
    except Exception as e:
        print(f"  [Aviso] Erro na geocodificação: {e}")

    return 'Endereço não disponível'


def importar_geosampa(caminho_geojson):
    transformer = Transformer.from_crs("EPSG:31983", "EPSG:4326", always_xy=True)

    with open(caminho_geojson, 'r', encoding='utf-8') as f:
        data = json.load(f)

    features = data.get('features', [])
    print(f"Total de registros encontrados no GeoSampa: {len(features)}")

    conn = get_db_connection()
    if not conn:
        print("Erro ao conectar ao banco de dados.")
        return

    cursor = conn.cursor()

    # Passo A: Identificar e popular a tabela 'operador' com base nos órgãos responsáveis únicos
    print("\nProcessando operadores...")
    orgaos_unicos = set()
    for feature in features:
        props = feature.get('properties', {})
        orgao = props.get('nm_orgao_responsavel')
        if orgao:
            orgaos_unicos.add(orgao.strip().title())

    operador_map = {}
    for orgao in orgaos_unicos:
        cursor.execute("SELECT id_operador FROM operador WHERE nome = %s;", (orgao,))
        resultado = cursor.fetchone()

        if resultado:
            operador_map[orgao] = resultado[0]
        else:
            # Informando o campo 'natureza' exigido pela tabela
            cursor.execute(
                "INSERT INTO operador (nome, natureza) VALUES (%s, %s);",
                (orgao, 'Público / Concessionária')
            )
            conn.commit()
            operador_map[orgao] = cursor.lastrowid

    print(f"-> {len(operador_map)} operadores cadastrados/mapeados com sucesso.")

    # Passo B: Limpar a tabela ponto_apoio antes de reimportar
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
    cursor.execute("TRUNCATE TABLE ponto_apoio;")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
    conn.commit()

    print("\nImportando pontos de apoio e buscando endereços reais...")

    query_ponto = """
        INSERT INTO ponto_apoio 
        (nome, endereco, latitude, longitude, tipo, capacidade_vagas, gratuito, coberto, status_operacional, data_ultima_verificacao, id_operador)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """

    inseridos = 0
    hoje = date.today().strftime('%Y-%m-%d')

    for index, feature in enumerate(features, start=1):
        geom = feature.get('geometry', {})
        coords = geom.get('coordinates', [])
        props = feature.get('properties', {})

        if not coords or len(coords) < 2:
            continue

        x, y = coords[0], coords[1]

        # Converte UTM para WGS84 (Lat/Lon)
        if abs(x) > 180 or abs(y) > 90:
            longitude, latitude = transformer.transform(x, y)
        else:
            longitude, latitude = x, y

        nome = props.get('nm_local') or 'Ponto de Apoio GeoSampa'

        # Mapeia o operador correspondente
        orgao_bruto = props.get('nm_orgao_responsavel')
        orgao_chave = orgao_bruto.strip().title() if orgao_bruto else None
        id_operador = operador_map.get(orgao_chave, 1)

        # Tipo do equipamento
        tipo_bruto = str(props.get('tx_tipo_equipamento', '')).upper()
        if 'BICICLETARIO' in tipo_bruto:
            tipo = 'Bicicletário'
        else:
            tipo = 'Paraciclo'

        # Vagas
        try:
            capacidade = int(props.get('qt_vaga', 0))
        except (ValueError, TypeError):
            capacidade = 0

        # Busca o endereço real via geocodificação reversa
        print(f"({index}/{len(features)}) Buscando endereço para: {nome}...")
        endereco = buscar_endereco_reverso(latitude, longitude)

        # Pausa obrigatória de 1 segundo para respeitar a API do Nominatim
        time.sleep(1)

        valores = (
            str(nome),
            str(endereco),
            float(latitude),
            float(longitude),
            tipo,
            capacidade,
            1,  # Gratuito
            1 if tipo == 'Bicicletário' else 0,  # Coberto
            'Ativo',
            hoje,
            id_operador
        )

        try:
            cursor.execute(query_ponto, valores)
            inseridos += 1
        except Exception as e:
            print(f"Erro ao inserir {nome}: {e}")

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n✅ Importação concluída com sucesso! {inseridos} registros atualizados.")


if __name__ == '__main__':
    caminho_geojson = os.path.join(os.path.dirname(__file__), 'geoportal_bicicletario_paraciclo.geojson')
    importar_geosampa(caminho_geojson)