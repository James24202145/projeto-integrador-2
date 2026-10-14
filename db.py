import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env local (se existir)
load_dotenv()


def get_db_connection():
    try:
        # Se estiver rodando no Cloud Run, usa o socket do Cloud SQL
        cloud_sql_connection_name = os.environ.get('INSTANCE_CONNECTION_NAME')

        if cloud_sql_connection_name:
            unix_socket_path = f"/cloudsql/{cloud_sql_connection_name}"

            conn = mysql.connector.connect(
                user=os.environ.get('DB_USER', 'root'),
                password=os.environ.get('DB_PASS'),
                database=os.environ.get('DB_NAME', 'ecomapa'),
                unix_socket=unix_socket_path
            )
        else:
            # Conexão local para testes no seu computador
            conn = mysql.connector.connect(
                host="localhost",
                user="root",
                password="Lu182JmS7",
                database="ecomapa"
            )

        # Força o fuso horário da sessão para o horário de Brasília (UTC-3)
        if conn and conn.is_connected():
            cursor = conn.cursor()
            cursor.execute("SET time_zone = '-03:00'")
            cursor.close()

        return conn
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None