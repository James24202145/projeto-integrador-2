import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

def get_db_connection():
    """
    Cria e retorna uma conexão com a base de dados MySQL
    utilizando as credenciais configuradas no .env.
    """
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'ecomapa'),
            port=int(os.getenv('DB_PORT', 3306)),
            charset='utf8mb4',
            use_unicode=True
        )
        return connection
    except Error as e:
        print(f"Erro ao conectar com o MySQL: {e}")
        return None

