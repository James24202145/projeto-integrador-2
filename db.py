import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env local
load_dotenv()

def get_db_connection():
    try:
        # Verifica se estamos no Cloud Run através da variável de conexão
        cloud_sql_connection_name = os.environ.get('INSTANCE_CONNECTION_NAME')

        if cloud_sql_connection_name:
            # Conexão via Unix Socket (para o Cloud Run)
            unix_socket_path = f"/cloudsql/{cloud_sql_connection_name}"
            conn = mysql.connector.connect(
                user=os.environ.get('DB_USER', 'root'),
                password=os.environ.get('DB_PASS') or os.environ.get('DB_PASSWORD'),
                database=os.environ.get('DB_NAME', 'cicloponto'),
                unix_socket=unix_socket_path
            )
        else:
            # Conexão local para testes no seu computador (Lê do .env ou usa os padrões locais)
            conn = mysql.connector.connect(
                host=os.environ.get('DB_HOST', 'localhost'),
                user=os.environ.get('DB_USER', 'root'),
                password=os.environ.get('DB_PASS') or os.environ.get('DB_PASSWORD', 'Lu182JmS7'),
                database=os.environ.get('DB_NAME', 'cicloponto')
            )

        return conn
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None