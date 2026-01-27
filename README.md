<img width="1773" height="582" alt="tph" src="https://github.com/user-attachments/assets/0b44a847-12da-4fcc-856c-ee571d02da1a" /># 🏆 TPHH Tracker - League of Legends Leaderboard

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

Um dashboard de ranking personalizado para League of Legends, focado em monitorar o progresso competitivo de um grupo específico de jogadores. O projeto consome a API oficial da Riot Games, armazena dados históricos e apresenta estatísticas detalhadas como Elo, PDL, Win Rate e Campeões mais jogados em uma interface moderna e responsiva.

---

## 📸 Screenshots

<img width="1773" height="582" alt="tph" src="https://github.com/user-attachments/assets/98c79bfe-8d52-4095-9b83-50d8420ec1e0" />

<img width="1550" height="664" alt="image" src="https://github.com/user-attachments/assets/ac41122f-20c7-497e-b4b3-af2d4af9a34d" />


---

## 🛠️ Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando uma arquitetura **Full-Stack** moderna, separada em microsserviços containerizados.

### 🧠 Backend (API & Lógica)
* **[Python 3.9+](https://www.python.org/):** Linguagem base para toda a lógica de negócios e mineração de dados.
* **[FastAPI](https://fastapi.tiangolo.com/):** Framework web de alta performance usado para criar os endpoints REST. Escolhido pela sua velocidade e suporte nativo a operações assíncronas (`async/await`).
* **[SQLAlchemy](https://www.sqlalchemy.org/):** ORM (Object Relational Mapper) utilizado para interagir com o banco de dados de forma pythonica, gerenciando modelos e sessões.
* **[Pydantic](https://docs.pydantic.dev/):** Utilizado para validação de dados e serialização dos schemas da API, garantindo que os dados da Riot cheguem e saiam tipados corretamente.
* **[Httpx](https://www.python-httpx.org/):** Cliente HTTP assíncrono usado para fazer requisições à **Riot Games API** sem bloquear o thread principal do servidor.
* **[Asyncio](https://docs.python.org/3/library/asyncio.html):** Utilizado para criar **Background Tasks** que atualizam os dados dos jogadores automaticamente a cada 30 minutos, mantendo o banco sempre fresco.

### 💾 Banco de Dados
* **[PostgreSQL](https://www.postgresql.org/):** Banco de dados relacional robusto.
    * **Uso:** Armazena o "cache" dos dados dos jogadores (Elo, Ícone, Win Rate) para evitar atingir o *Rate Limit* da API da Riot e permitir o carregamento instantâneo do Frontend.
    * **Hospedagem:** Neon.tech (Serverless Postgres).

### 🎨 Frontend (Interface)
* **[React.js](https://react.dev/):** Biblioteca principal para construção da interface de usuário baseada em componentes.
* **[Vite](https://vitejs.dev/):** Build tool de próxima geração, garantindo um ambiente de desenvolvimento ultra-rápido.
* **[Tailwind CSS](https://tailwindcss.com/):** Framework de utilitários CSS usado para estilização completa (Design System, Dark Mode, Responsividade).
* **[Recharts](https://recharts.org/):** Biblioteca de gráficos composta utilizada para renderizar a curva de evolução de PDL (Simulada/Histórica) nos modais dos jogadores.
* **[Axios](https://axios-http.com/):** Cliente HTTP para conectar o Frontend ao Backend.
* **[Lucide React](https://lucide.dev/):** Conjunto de ícones leves e modernos.

### 🐳 DevOps & Infraestrutura
* **[Docker & Docker Compose](https://www.docker.com/):** Utilizado para containerizar a aplicação completa (Front, Back e Banco) garantindo que o ambiente de desenvolvimento seja idêntico ao de produção e livre de erros de configuração ("funciona na minha máquina").
* **[Render](https://render.com/):** Hospedagem do Backend (Container Docker).
* **[Vercel](https://vercel.com/):** Hospedagem do Frontend (Static Site).

---

## ⚙️ Funcionalidades

* **Ranking em Tempo Real:** Ordenação automática por Tier (Challenger > Ferro), Rank (I > IV) e PDL.
* **Identidade Visual de High Elo:** Destaque visual especial para os Top 3 jogadores com temas inspirados nos elos Challenger, Grandmaster e Master.
* **Sistema de Maestria:** Exibição automática dos 3 campeões com maior maestria de cada jogador.
* **Atualização Automática:** O sistema possui um "Worker" em segundo plano que varre a lista de jogadores e atualiza seus dados periodicamente sem necessidade de ação manual.
* **Links Externos:** Integração direta com o League of Graphs ao clicar nos perfis.

---

## 🚀 Como Rodar Localmente

Pré-requisitos: Ter **Docker** e **Docker Compose** instalados.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU-USUARIO/tphh-tracker.git](https://github.com/SEU-USUARIO/tphh-tracker.git)
    cd tphh-tracker
    ```

2.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
    ```env
    # Database (Padrão do Docker Compose)
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=admin
    POSTGRES_DB=lolranking
    DATABASE_URL=postgresql://postgres:admin@db:5432/lolranking

    # Riot Games API (Obtenha em developer.riotgames.com)
    RIOT_API_KEY=RGAPI-SUA-CHAVE-AQUI
    ```

3.  **Inicie a Aplicação:**
    ```bash
    docker compose up --build
    ```

4.  **Acesse:**
    * Frontend: `http://localhost:5173`
    * Backend Docs (Swagger): `http://localhost:8000/docs`

---

## ☁️ Arquitetura de Deploy (Split Deployment)

Para manter o projeto online gratuitamente, utilizamos uma estratégia dividida:

1.  **Banco de Dados:** Criado no **Neon.tech**.
2.  **Backend:** O Dockerfile do backend é construído e hospedado no **Render.com** (conectado ao banco do Neon via variável de ambiente).
3.  **Frontend:** O build do Vite é hospedado na **Vercel**, apontando para a API do Render.

---

## ⚠️ Nota sobre a Riot API

Este projeto utiliza uma **Development API Key**.
* A chave expira a cada alguns meses
* Para manter o projeto funcionando, é necessário regenerar a chave no portal da Riot e atualizar a variável de ambiente `RIOT_API_KEY` no servidor (Render).

---

## 📝 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para usar e modificar.

---

Desenvolvido com 🧡 pela **Team Play Hard**.
