# Projeto Integrador II
```
[ Navegador do Usuário (Frontend) ]
  HTML5 + CSS + JavaScript (Leaflet.js / Chart.js / Acessibilidade a11y)
          │  ▲
   requisições HTTP / JSON (Fetch)
          ▼  │
[ Servidor / Nuvem (Backend) ]
  Python (Flask) ─────────► Banco de Dados (MySQL)
     │        │             (Pontos de apoio, Segurança, Ocorrências)
     │        │
     │        └──► APIs Externas
     │             (OpenStreetMap / Nominatim / OpenWeatherMap)
     ▼
[ Módulo de Análise de Dados ]
  Pandas / NumPy ──► Chart.js
  (Tratamento)       (Painel Estatístico)

```

# 🚴 CicloPonto

**CicloPonto** é uma plataforma colaborativa de mapeamento, localização de bicicletários e compartilhamento de informações de segurança para ciclistas urbanos.

O projeto visa promover a mobilidade sustentável, oferecendo aos ciclistas uma ferramenta acessível para encontrar pontos de apoio, avaliar a segurança de locais de estacionamento e relatar incidentes na cidade.

🌐 **Versão publicada:** https://cicloponto-service-875547493346.southamerica-east1.run.app/

---

## ✨ Funcionalidades

* **Mapa interativo** com bicicletários, paraciclos e oficinas da cidade de São Paulo (dados iniciais do GeoSampa).
* **Filtros** por tipo de ponto, gratuidade, cobertura e segurança.
* **Busca por nome ou endereço:** o mapa centraliza no endereço, destaca um raio de 500 m e informa os pontos próximos ou o mais próximo.
* **Cadastro colaborativo** de novos pontos, com um toque no mapa, além de edição e exclusão.
* **Registro de ocorrências** em cinco categorias (vandalismo, avaria, lotação, furto/roubo e ponto fechado).
* **Alertas nos pins:**
  * **amarelo com "!"**: a última ocorrência foi vandalismo, avaria ou furto;
  * **vermelho com ⊘**: ponto fechado, ou lotado nas últimas 3 horas.
* **Ficha do ponto** com rota de bicicleta no Google Maps e botão **Ouvir**, que lê as informações em voz alta.
* **Painel Estatístico** com sete visões: infraestrutura, gratuidade, segurança, situação dos pontos, tipos de ocorrência, evolução temporal e capacidade de vagas.
* **Clima atual** de São Paulo (OpenWeatherMap).
* **Modo noturno** e **tamanho de fonte** (A, A+, A++), com a escolha salva no navegador.

---

## ♿ Acessibilidade

A interface segue as diretrizes **WCAG 2.1, nível AA**:

* **Leitores de tela:** compatível com TalkBack e VoiceOver, com nomes e estados em todos os botões, janelas anunciadas como diálogo e gráficos descritos em texto.
* **Teclado:**
  * navegação completa com Tab, em ordem lógica;
  * foco sempre visível;
  * Enter abre a ficha do ponto e Esc fecha as janelas.
* **Contraste:** cores medidas nos modos claro e noturno, todas acima do mínimo.
* **Ampliação:**
  * fontes em `rem`: A, A+ e A++ ampliam a página inteira;
  * layout íntegro com zoom de 200%.
* **Informação não depende só da cor:** os tipos de ponto têm ícones próprios, e os alertas têm selos com símbolo.
* **Área de toque:** controles principais com pelo menos 44 x 44 px.
* **Segurança de uso:** aviso para consultar e registrar ocorrências com a bicicleta parada.

Os detalhes, as medições e os testes estão em [`docs/acessibilidade/`](docs/acessibilidade/):
* [`mudancas.md`](docs/acessibilidade/mudancas.md): resumo das mudanças em linguagem simples;
* [`contraste.md`](docs/acessibilidade/contraste.md): medições de contraste antes e depois;
* [`relatorio-testes.md`](docs/acessibilidade/relatorio-testes.md): testes feitos e pendentes, com instruções.

---

## 🛠️ Arquitetura e Tecnologias Utilizadas

A aplicação foi desenvolvida seguindo uma arquitetura modular, dividida nas seguintes camadas:

### 🖥️ Frontend (Navegador do Usuário)
* **HTML5 & CSS3:** Estruturação semântica das páginas e estilização responsiva da interface.
* **JavaScript (Script Web):** Responsável pelo dinamismo da interface, validação de dados no cliente e requisições assíncronas (`fetch`).
* **Leaflet.js + OpenStreetMap:** Mapa interativo e marcadores dos pontos de apoio.
* **Chart.js:** Gráficos do Painel Estatístico.
* **Web Speech API:** Leitura em voz alta da ficha do ponto (botão Ouvir), sem dependências extras.
* **Acessibilidade (a11y):** Implementação de recursos para navegação por teclado, compatibilidade com leitores de tela e padrões visualmente acessíveis.

### ⚙️ Backend (Servidor)
* **Python (Flask):** Framework web responsável pelo gerenciamento de rotas e regras de negócio, organizado em blueprints.
* **Consumo de APIs Externas:** Integração com o Nominatim (busca de endereços) e o OpenWeatherMap (clima).

### 🗄️ Banco de Dados
* **MySQL:** Banco de dados relacional para armazenamento persistente, seguro e estruturado de todas as informações da aplicação.

### 📊 Análise de Dados
* **Pandas & NumPy:** Manipulação, limpeza, filtragem e processamento estatístico dos dados extraídos do banco de dados e APIs.
* **Chart.js:** Gráficos interativos com métricas de infraestrutura, segurança e ocorrências.

### 🚀 Infraestrutura e Versionamento
* **Git & GitHub:** Controle de versão distribuído e gerenciamento colaborativo do código-fonte.
* **Entregas Contínuas (CD):** Desenvolvimento baseado em pequenas iterações e commits diários frequentes.
* **Google Cloud Run:** Hospedagem da aplicação (região `southamerica-east1`), com deploy pelo `Dockerfile` e banco no Cloud SQL.

---

## 📁 Estrutura do Projeto

```text
Projeto Integrador II/
├── .gitignore
├── .env                    # Credenciais locais (não vai para o repositório)
├── requirements.txt
├── Dockerfile
├── app.py                  # Cria o Flask e registra as rotas
├── config.py               # Constantes (fuso, janela de lotação, busca, clima...)
├── db.py                   # Conexão com o MySQL (local ou Cloud SQL)
├── utils.py                # Funções de data/hora (fuso de São Paulo)
├── routes/
│   ├── paginas.py          # Página principal
│   ├── pontos.py           # API de pontos de apoio
│   ├── ocorrencias.py      # API de ocorrências e estatísticas
│   ├── clima.py            # API de clima (OpenWeatherMap)
│   └── geocodificacao.py   # Busca de endereços (Nominatim)
├── database/               # Backup do banco e script de importação do GeoSampa
├── docs/
│   └── acessibilidade/     # Mudanças, contraste e relatório de testes
├── static/
│   ├── css/style.css
│   └── js/main.js
└── templates/
    └── index.html
```

## 🔌 Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/pontos` | Lista os pontos de apoio ativos, com segurança e última ocorrência |
| POST | `/api/pontos/novo` | Cadastra um novo ponto |
| PUT | `/api/pontos/<id>/editar` | Edita vagas, gratuidade, cobertura e segurança de um ponto |
| DELETE | `/api/pontos/<id>` | Exclui um ponto |
| GET | `/api/pontos/<id>/ocorrencias` | Lista as últimas ocorrências de um ponto |
| POST | `/api/ocorrencias` | Registra uma ocorrência |
| GET | `/api/estatisticas/ocorrencias` | Totais de ocorrências por tipo e por dia (últimos 30 dias) |
| GET | `/api/geocodificar?q=<endereço>` | Converte um endereço de São Paulo em coordenadas |
| GET | `/api/clima` | Clima atual de São Paulo |

---

## 🚀 Como Executar o Projeto Localmente

**1. Clonar o repositório:**

```bash
git clone https://github.com/James24202145/projeto-integrador-2.git
cd projeto-integrador-2
```

**2. Criar e ativar o ambiente virtual (venv):**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**3. Instalar as dependências:**

```bash
pip install -r requirements.txt
```

**4. Configurar as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto, que já está no `.gitignore`, com as chaves abaixo e os seus próprios valores:

```text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_local
DB_NAME=cicloponto
OPENWEATHER_API_KEY=sua_chave_do_openweathermap
```

> Nunca coloque senhas ou chaves de API no código nem no repositório. Em produção, elas ficam nas variáveis de ambiente do Cloud Run.

Para criar o banco local, importe o backup em `database/backup_ciclomapa.sql`.

**5. Executar a aplicação:**

```bash
python3 app.py
```

A aplicação fica disponível em http://localhost:5000.

---

## ☁️ Deploy no Google Cloud Run

O deploy é feito a partir do código-fonte, usando o `Dockerfile`.

**1. Publicar uma revisão de teste, sem tráfego:**

```bash
gcloud run deploy cicloponto-service --source . --region southamerica-east1 --no-traffic --tag teste
```

**2. Testar a URL marcada com "teste" e, depois, direcionar o tráfego para ela:**

```bash
gcloud run services update-traffic cicloponto-service --region southamerica-east1 --to-latest
```

As variáveis de ambiente (`OPENWEATHER_API_KEY`, credenciais do banco e `INSTANCE_CONNECTION_NAME`) são configuradas no próprio serviço do Cloud Run.
