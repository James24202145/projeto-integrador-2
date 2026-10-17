import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        # Tenta pegar as variáveis de ambiente gerais (funciona tanto local quanto no Cloud Run com IP)
        host = os.environ.get('DB_HOST', 'localhost')
        user = os.environ.get('DB_USER', 'root')
        password = os.environ.get('DB_PASS') or os.environ.get('DB_PASSWORD', 'Lu182JmS7')
        database = os.environ.get('DB_NAME', 'cicloponto')

        cloud_sql_connection_name = os.environ.get('INSTANCE_CONNECTION_NAME')

        if cloud_sql_connection_name:
            unix_socket_path = f"/cloudsql/{cloud_sql_connection_name}"
            conn = mysql.connector.connect(
                user=user,
                password=password,
                database=database,
                unix_socket=unix_socket_path
            )
        else:
            conn = mysql.connector.connect(
                host=host,
                user=user,
                password=password,
                database=database
            )

        return conn
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None