import json
import os
import sys
from datetime import date

# Adiciona o diretório raiz ao path para importar o db.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from db import get_db_connection


def mapear_tipo(tags):
    """Mapeia as tags do OpenStreetMap para os tipos do Ecomapa."""
    amenity = tags.get('amenity', '')
    shop = tags.get('shop', '')
    bicycle_parking = tags.get('bicycle_parking', '')

    if shop == 'bicycle' or amenity == 'bicycle_repair_station':
        return 'Oficina / Suporte'
    elif amenity == 'bicycle_parking':
        if bicycle_parking in ['stands', 'shed', 'lockers']:
            return 'Bicicletário'
        return 'Paraciclo'
    return 'Paraciclo'


def importar_dados_osm(caminho_json):
    # 1. Carrega o arquivo JSON do Overpass
    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    elements = data.get('elements', [])
    print(f"Total de elementos encontrados no JSON: {len(elements)}")

    conn = get_db_connection()
    if not conn:
        print("Erro ao conectar ao banco de dados.")
        return

    cursor = conn.cursor()

    # Incluída a coluna data_ultima_verificacao na consulta
    query = """
        INSERT INTO ponto_apoio 
        (nome, endereco, latitude, longitude, tipo, capacidade_vagas, gratuito, coberto, status_operacional, data_ultima_verificacao, id_operador)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """

    inseridos = 0
    hoje = date.today().strftime('%Y-%m-%d')

    for elem in elements:
        # Garante que possui coordenadas (nodes ou ways com center)
        lat = elem.get('lat') or (elem.get('center', {}).get('lat') if 'center' in elem else None)
        lon = elem.get('lon') or (elem.get('center', {}).get('lon') if 'center' in elem else None)

        if not lat or not lon:
            continue

        tags = elem.get('tags', {})

        # Trata campos nulos/ausentes
        tipo = mapear_tipo(tags)
        nome = tags.get('name') or f"{tipo} - OSM {elem.get('id')}"

        # Endereço montado pelas tags de rua/bairro se existirem
        rua = tags.get('addr:street', '')
        numero = tags.get('addr:housenumber', '')
        bairro = tags.get('addr:suburb', '')

        endereco = f"{rua} {numero}".strip()
        if bairro:
            endereco += f" - {bairro}" if endereco else bairro
        if not endereco:
            endereco = "Endereço não especificado"

        # Capacidade de vagas
        try:
            capacidade = int(tags.get('capacity', 0))
        except ValueError:
            capacidade = 0

        # Coberto (covered = yes/no)
        coberto = 1 if tags.get('covered') == 'yes' else 0

        # Gratuito (fee = no -> gratuito = 1)
        gratuito = 0 if tags.get('fee') == 'yes' else 1

        # Prepara a tupla com os valores para o MySQL
        valores = (
            nome,
            endereco,
            float(lat),
            float(lon),
            tipo,
            capacidade,
            gratuito,
            coberto,
            'Ativo',
            hoje,  # Adiciona a data atual (YYYY-MM-DD)
            1  # ID do operador padrão
        )

        try:
            cursor.execute(query, valores)
            inseridos += 1
        except Exception as e:
            print(f"Erro ao inserir o ponto {nome}: {e}")

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n✅ Importação concluída! {inseridos} novos pontos cadastrados na tabela 'ponto_apoio'.")


if __name__ == '__main__':
    arquivo_exportado = os.path.join(os.path.dirname(__file__), 'export.json')
    importar_dados_osm(arquivo_exportado)