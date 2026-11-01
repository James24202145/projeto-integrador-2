import os
from datetime import timedelta
from zoneinfo import ZoneInfo

from dotenv import load_dotenv

# Carrega variáveis do arquivo .env local
load_dotenv()

# Fuso horário da aplicação. Todas as datas são geradas aqui, no Python,
# e nunca pelo relógio do MySQL (NOW()), que no Cloud SQL costuma estar em UTC.
FUSO_SP = ZoneInfo("America/Sao_Paulo")

# Tempo durante o qual uma ocorrência "Ponto de Apoio Lotado" continua valendo
JANELA_LOTADO = timedelta(hours=3)

# Formato usado para gravar datas nas colunas DATETIME do MySQL
FORMATO_DATA_MYSQL = '%Y-%m-%d %H:%M:%S'

# Operador atribuído aos pontos cadastrados pela interface (criado automaticamente se não existir)
NOME_OPERADOR_COLABORATIVO = 'Cadastro Colaborativo'
NATUREZA_OPERADOR_COLABORATIVO = 'Colaborativo / Usuários'

# Coordenadas padrão centradas em São Paulo / Região Metropolitana
LATITUDE_PADRAO = '-23.55052'
LONGITUDE_PADRAO = '-46.633309'

# Busca de endereços no Nominatim (OpenStreetMap), limitada ao município de São Paulo
URL_NOMINATIM_BUSCA = 'https://nominatim.openstreetmap.org/search'
USER_AGENT_NOMINATIM = 'Cicloponto-Projeto-PI2-SP'
LIMITES_SAO_PAULO = '-46.826,-23.356,-46.365,-24.008'  # oeste, norte, leste, sul

# Chave do OpenWeatherMap, lida do .env (local) ou das variáveis de ambiente (Cloud Run)
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY')
