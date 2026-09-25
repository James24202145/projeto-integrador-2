# Projeto Integrador II
```
[ Navegador do Usuário (Frontend) ]
  HTML5 + CSS + JavaScript (Leaflet.js / Acessibilidade a11y)
          │  ▲
   requisições HTTP / JSON (Fetch)
          ▼  │
[ Servidor / Nuvem (Backend) ]
  Python (Flask) ─────────► Banco de Dados (MySQL)
     │        │             (Usuários, Bicicletários, Incidentes)
     │        │
     │        └──► APIs Externas
     │             (OpenStreetMap / OpenWeatherMap)
     ▼
[ Módulo de Análise de Dados ]
  Pandas / NumPy ──► Plotly / Chart.js
  (Tratamento)       (Dashboards de Segurança)

```

# 🚴 CicloPonto

**CicloPonto** é uma plataforma colaborativa de mapeamento, localização de bicicletários e compartilhamento de informações de segurança para ciclistas urbanos.

O projeto visa promover a mobilidade sustentável, oferecendo aos ciclistas uma ferramenta acessível para encontrar pontos de apoio, avaliar a segurança de locais de estacionamento e relatar incidentes na cidade.

---


## 🛠️ Arquitetura e Tecnologias Utilizadas

A aplicação foi desenvolvida seguindo uma arquitetura modular, dividida nas seguintes camadas:

### 🖥️ Frontend (Navegador do Usuário)
* **HTML5 & CSS3:** Estruturação semântica das páginas e estilização responsiva da interface.
* **JavaScript (Script Web):** Responsável pelo dinamismo da interface, validação de dados no cliente e requisições assíncronas (`fetch`).
* **Acessibilidade (a11y):** Implementação de recursos para navegação por teclado, compatibilidade com leitores de tela e padrões visualmente acessíveis.

### ⚙️ Backend (Servidor)
* **Python (Flask):** Framework web responsável pelo gerenciamento de rotas, regras de negócio, autenticação e execução de testes automatizados.
* **Consumo de APIs Externas:** Integração com serviços de terceiros para busca e enriquecimento de dados em tempo real.

### 🗄️ Banco de Dados
* **MySQL:** Banco de dados relacional para armazenamento persistente, seguro e estruturado de todas as informações da aplicação.

### 📊 Análise de Dados
* **Pandas & NumPy:** Manipulação, limpeza, filtragem e processamento estatístico dos dados extraídos do banco de dados e APIs.
* **Plotly / Chart.js / Matplotlib:** Geração de dashboards e gráficos interativos para exibição de métricas de segurança e relatórios urbanos na plataforma.

### 🚀 Infraestrutura e Versionamento
* **Git & GitHub:** Controle de versão distribuído e gerenciamento colaborativo do código-fonte.
* **Entregas Contínuas (CD):** Desenvolvimento baseado em pequenas iterações e commits diários frequentes.
* **Nuvem:** Ambiente de hospedagem e deploy contínuo para disponibilidade da aplicação e do banco de dados na web.

---

## 📁 Estrutura Inicial do Projeto

```text
Projeto Integrador II/
├── .gitignore
├── requirements.txt
├── app.py
├── static/
│   ├── css/
│   └── js/
└── templates/
    └── index.html
```

## 🚀 Como Executar o Projeto Localmente

**1. Clonar o repositório:**

```
git clone [https://github.com/James24202145/projeto-integrador-2.git](https://github.com/James24202145/projeto-integrador-2.git)
cd projeto-integrador-2
```
**2. Criar e ativar o ambiente virtual (venv):**

```￼
python3 -m venv .venv
source .venv/bin/activate
```
**3. Instalar as dependências:**

```￼
pip install -r requirements.txt
```

**4. Executar a aplicação:**

```￼
python3 app.py
```
