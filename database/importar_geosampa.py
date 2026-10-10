import json
import os
import sys
from datetime import date
from pyproj import Transformer

# Adiciona o diretório raiz ao path para importar o db.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from db import get_db_connection

def importar_geosampa(caminho_geojson):
    # Configura o transformador de coordenadas: SIRGAS 2000 / UTM zone 23S (EPSG:31983) -> WGS84 (EPSG:4326)
    # se o GeoSampa estiver em SAD69/UTM 23S (EPSG:29193) ou UTM 23S SIRGAS 2000, o pyproj converte com precisão.
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

    query = """
        INSERT INTO ponto_apoio 
        (nome, endereco, latitude, longitude, tipo, capacidade_vagas, gratuito, coberto, status_operacional, data_ultima_verificacao, id_operador)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """

    inseridos = 0
    hoje = date.today().strftime('%Y-%m-%d')

    for feature in features:
        geom = feature.get('geometry', {})
        coords = geom.get('coordinates', [])
        props = feature.get('properties', {})

        if not coords or len(coords) < 2:
            continue

        x, y = coords[0], coords[1]

        # Verifica se as coordenadas estão em UTM (valores grandes em metros) e converte para Lat/Lon
        if abs(x) > 180 or abs(y) > 90:
            longitude, latitude = transformer.transform(x, y)
        else:
            longitude, latitude = x, y

        # Campos mapeados com os nomes reais do GeoSampa
        nome = props.get('nm_local') or 'Ponto de Apoio GeoSampa'
        orgao = props.get('nm_orgao_responsavel')
        endereco = f"Responsável: {orgao}" if orgao else "Endereço não especificado"

        # Tipo do equipamento
        tipo_bruto = str(props.get('tx_tipo_equipamento', '')).upper()
        if 'BICICLETARIO' in tipo_bruto:
            tipo = 'Bicicletário'
        elif 'PARACICLO' in tipo_bruto:
            tipo = 'Paraciclo'
        else:
            tipo = 'Paraciclo'

        # Vagas
        try:
            capacidade = int(props.get('qt_vaga', 0))
        except (ValueError, TypeError):
            capacidade = 0

        valores = (
            str(nome),
            str(endereco),
            float(latitude),
            float(longitude),
            tipo,
            capacidade,
            1,  # Gratuito (padrão 1 para equipamentos públicos)
            1 if tipo == 'Bicicletário' else 0, # Coberto
            'Ativo',
            hoje,
            1   # ID operador padrão
        )

        try:
            cursor.execute(query, valores)
            inseridos += 1
        except Exception as e:
            print(f"Erro ao inserir {nome}: {e}")

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n✅ Importação do GeoSampa concluída! {inseridos} registros cadastrados com sucesso na tabela 'ponto_apoio'.")

if __name__ == '__main__':
    caminho_geojson = os.path.join(os.path.dirname(__file__), 'geoportal_bicicletario_paraciclo.geojson')
    importar_geosampa(caminho_geojson)