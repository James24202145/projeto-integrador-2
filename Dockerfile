# Usa uma imagem oficial leve do Python
FROM python:3.11-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código do projeto para o container
COPY . .

# Expõe a porta que o Cloud Run utiliza
EXPOSE 8080

# Comando para iniciar a aplicação usando o Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]