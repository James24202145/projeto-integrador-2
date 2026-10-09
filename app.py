from flask import Flask, jsonify, render_template
from db import get_db_connection

app = Flask(__name__)
#app.config['JSON_AS_ASCII'] = False


# Rota da página web (Front-end com Leaflet.js)
@app.route('/')
def index():
    return render_template('index.html')


# Rota da API REST
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


if __name__ == '__main__':
    app.run(debug=True)
