from datetime import datetime

from config import FUSO_SP, JANELA_LOTADO, FORMATO_DATA_MYSQL


def agora_sp():
    """Data e hora atuais de São Paulo, sem informação de fuso (formato do DATETIME do MySQL)."""
    return datetime.now(FUSO_SP).replace(tzinfo=None)


def agora_sp_formatado():
    """Data e hora atuais de São Paulo como texto pronto para o MySQL."""
    return agora_sp().strftime(FORMATO_DATA_MYSQL)


def limite_lotado():
    """Ocorrências de lotação anteriores a este momento são ignoradas."""
    return agora_sp() - JANELA_LOTADO
