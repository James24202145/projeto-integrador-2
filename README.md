# Projeto Integrador II
```
[ Navegador do Usuário ]
  HTML5 + CSS + JavaScript (Script Web / Acessibilidade)
          │  ▲
   requisições HTTP / JSON (Fetch)
          ▼  │
[ Servidor / Nuvem ]
  Python (Flask) ─────────► Banco de Dados (MySQL)
     │        │
     │        └──► APIs Externas
     ▼
[ Análise de Dados ]
  Pandas / NumPy (Tratamento e Processamento)
     │
     └──► Matplotlib / Seaborn / Plotly (Geração de Gráficos e Dashboards)

```

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
* **Matplotlib / Seaborn / Plotly:** Geração de gráficos, métricas e dashboards interativos para exibição na interface web.

### 🚀 Infraestrutura e Versionamento
* **Git & GitHub:** Controle de versão distribuído e gerenciamento colaborativo do código-fonte.
* **Nuvem:** Ambiente de hospedagem e deploy contínuo para disponibilidade da aplicação e do banco de dados na web.
