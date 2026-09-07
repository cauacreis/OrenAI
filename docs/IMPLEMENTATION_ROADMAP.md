# OrenAI — Roadmap de Implementação e Especificação de Engenharia 🗺️⛏️
**Plano Diretor de Desenvolvimento Técnico, Arquitetura Monorepo e Fases de Execução**

---

## 1. Visão Geral e Propósito

Este documento consolida a especificação técnica executável para a implementação completa da plataforma **OrenAI** (do ambiente de desenvolvimento à infraestrutura de produção). 

O objetivo é transformar a arquitetura conceitual e o protótipo funcional em uma plataforma SaaS B2B empresarial de **Mapeamento de Prospectividade Mineral (MPM)** com **Sistema Multi-Agentes (MAS)**, explicabilidade **SHAP (XAI)** e soberania decisória humana (**Human-in-the-Loop - HITL**).

---

## 2. Decisões Arquiteturais Fixas vs. Abertas

Para orientar a equipe de engenharia e agentes de desenvolvimento autônomo:

| Componente | Classificação | Diretriz de Engenharia |
| :--- | :--- | :--- |
| **Padrão MAS / MoE** | `[DECISÃO FIXA]` | Agente Orquestrador central despachando para Subagentes Especialistas isolados por commodity (Ouro, Cobre, Lítio). |
| **Isolamento de Pesos** | `[DECISÃO FIXA]` | Zero vazamento de hiperparâmetros ou pesos entre modelos de diferentes minerais. Silos de contêineres independentes. |
| **Explicabilidade Obrigatória** | `[DECISÃO FIXA]` | Nenhuma predição é entregue como "caixa-preta". Toda anomalia deve ser acompanhada de decomposição matemática via SHAP. |
| **Soberania Humana (HITL)** | `[DECISÃO FIXA]` | A IA não despacha sondas de perfuração. O geólogo analista aprova, ajusta ou rejeita alvos no dashboard. |
| **Data Bootstrap Governamental** | `[DECISÃO FIXA]` | Treinamento e validação de PoC baseados em dados públicos abertos (CPRM, ANM, USGS) sem dependência de dados sigilosos iniciais. |
| **Frameworks de ML** | `[DECISÃO ABERTA]` | Liberdade para otimizar entre XGBoost, LightGBM ou CatBoost para dados tabulares, e U-Net/ResNet para dados espaciais. |
| **Stack de Frontend** | `[DECISÃO ABERTA]` | React 18 / Next.js com Tailwind CSS, Leaflet.js / Mapbox GL para 2D e Three.js para renderização 3D WebGL. |
| **Orquestração de Nuvem** | `[DECISÃO ABERTA]` | Docker Compose para desenvolvimento local; Kubernetes (EKS/GKE) ou AWS ECS para ambiente produtivo escalável. |

---

## 3. Estrutura Proposta para o Monorepo

```text
orenai/
├── .github/
│   └── workflows/              # Pipelines de CI/CD (lint, testes unitários, build Docker)
├── backend/
│   ├── app/
│   │   ├── api/                # Rotas REST/FastAPI (auth, projetos, analises, relatorios)
│   │   ├── core/               # Configurações globais, segurança JWT e database session
│   │   ├── models/             # Modelos relacionais SQLAlchemy/PostGIS (3FN)
│   │   ├── schemas/            # Schemas de validação Pydantic v2
│   │   └── services/           # Lógica de negócio e mensageria assíncrona
│   ├── Dockerfile
│   └── pyproject.toml
├── agents/
│   ├── orchestrator/           # Agente Gestor: classificação semântica de intenções e roteamento
│   │   ├── router.py           # Intent Classifier e gerenciador de ciclo de vida de contêineres
│   │   └── Dockerfile
│   ├── copper_porphyry/        # Subagente Especialista em Cobre Pórfiro / IOCG
│   │   ├── pipeline.py         # Pipeline de pré-processamento geoquímico e razões de pathfinders
│   │   ├── model.py            # Modelos MAPDA treinados para depósitos de cobre
│   │   └── Dockerfile
│   └── gold_epithermal/        # Subagente Especialista em Ouro Epitermal / Orogênico
│       ├── pipeline.py         # Pipeline específico para anomalias Au-As-Sb-Hg
│       ├── model.py            # Modelos MAPDA treinados para depósitos auríferos
│       └── Dockerfile
├── mapda/                      # Núcleo do Mineral Anomaly Pattern Detection Algorithm
│   ├── tabular/                # Modelos Gradient Boosting (XGBoost/LightGBM)
│   ├── spatial/                # Modelos Convolucionais para rasters geofísicos (U-Net)
│   ├── ensemble/               # Stacking meta-learner combinando predição tabular + espacial
│   └── evaluation/             # Métricas geocientíficas (AUC-ROC, F1-Score, Spatial Cross-Validation)
├── xai/                        # Módulo de Inteligência Artificial Explicável
│   ├── shap_engine.py          # Cálculo de TreeSHAP / KernelSHAP por amostra
│   └── visualizers.py          # Decomposição de waterfall plots e gráficos de contribuição
├── frontend/                   # Dashboard SPA Human-in-the-Loop
│   ├── src/
│   │   ├── components/
│   │   │   ├── map2d/          # Visualização geoespacial interativa (Leaflet/Mapbox)
│   │   │   ├── subsurface3d/   # Visualização de subsuperfície em Three.js
│   │   │   ├── xai_panel/      # Painel de gráficos explicativos SHAP
│   │   │   └── hitl_controls/  # Controles de aprovação/rejeição e Active Learning
│   │   ├── pages/
│   │   └── services/           # Comunicação com a API backend
│   ├── package.json
│   └── Dockerfile
├── data/
│   ├── etl/                    # Scripts de ingestão automatizada (CPRM GeoBank, ANM SIGMINE, USGS)
│   ├── raw/                    # Amostras brutas (armazenadas via DVC / S3)
│   └── processed/              # Datasets normalizados e indexados espacialmente
└── infra/
    ├── docker-compose.yml      # Ambiente local completo com PostgreSQL/PostGIS, Backend e Frontend
    ├── k8s/                    # Manifests Kubernetes para orquestração de subagentes sob demanda
    └── terraform/              # Provisionamento de infraestrutura como código (AWS/GCP)
```

---

## 4. Fases Cronológicas de Implementação

```
[Fase 1: Fundação] ──> [Fase 2: ETL & Dados] ──> [Fase 3: MAPDA & XAI]
         │
         v
[Fase 4: Dashboard HITL] ──> [Fase 5: Integração & Deploy] ──> [Fase 6: Piloto Comercial]
```

### Fase 1: Fundação e Infraestrutura Base (Semanas 1-3)
- [ ] Inicialização do repositório monorepo com configuração de ferramentas de linting (`ruff`, `black`, `eslint`) e tipagem estrita (`mypy`, `typescript`).
- [ ] Configuração do banco de dados relacional **PostgreSQL 16 com extensão PostGIS**, implementando o DER em 3FN definido na arquitetura.
- [ ] Construção do esqueleto da API em **FastAPI** com autenticação JWT e controle de acesso RBAC (`GEOLOGO`, `GESTOR`, `AUDITOR`).
- [ ] Implementação do **Agente Gestor Orquestrador**: serviço assíncrono capaz de identificar a intenção do usuário e orquestrar a inicialização/desativação de contêineres Docker de especialistas sob demanda.

### Fase 2: Ingestão de Dados e Feature Engineering Geocientífica (Semanas 4-6)
- [ ] Desenvolvimento dos conectores ETL para download e limpeza das bases públicas:
  - *CPRM GeoBank:* Amostras de solo e sedimentos de corrente em formato tabular;
  - *ANM SIGMINE:* Polígonos de concessões e depósitos catalogados no território nacional;
  - *USGS Data Series 801:* Base de referência continental para testes de conformidade.
- [ ] Construção da camada de engenharia de atributos geoquímicos (*Feature Engineering*):
  - Tratamento de censura analítica (amostras abaixo do limite de detecção laboratorial via imputação estatística);
  - Transformação log-centrada (*Centered Log-Ratio - CLR*) para contornar a natureza composicional fechada dos teores percentuais/ppm;
  - Cálculo de razões geoquímicas diagnósticas e elementos indicadores (*pathfinders*: As, Sb, Bi, Mo, Cu, Au);
  - Geração de features de contexto espacial (distância euclidiana a falhas geológicas mapeadas, anomalia magnética residual).
- [ ] Implementação de divisão amostral espacialmente desacoplada (*Spatial Cross-Validation*) para prevenir vazamento de dados geográficos entre treino e teste.

### Fase 3: Motor Preditivo MAPDA e Módulo XAI (Semanas 7-10)
- [ ] Treinamento dos modelos tabulares dedicados:
  - *Subagente Cobre:* Gradient Boosting (*XGBoost*) treinado sobre alvos do tipo Pórfiro e IOCG;
  - *Subagente Ouro:* Gradient Boosting treinado sobre depósitos orogênicos e epitermais.
- [ ] Resolução do desbalanceamento extremo de classes (singularidade de depósitos):
  - Formulação via *Positive-Unlabeled (PU) Learning* e balanceamento com *Focal Loss / SMOTE*.
- [ ] Implementação do módulo **SHAP (SHapley Additive exPlanations)**:
  - Extração de valores Shapley para cada alvo ranqueado;
  - Decomposição das 5 variáveis mais determinantes para o score de cada coordenadas;
  - Exportação de metadados em JSON para consumo direto pelo frontend.
- [ ] Validação empírica por re-descoberta: o motor deve identificar autonomamente pelo menos **80% dos depósitos conhecidos** no Quadrilátero Ferrífero (Au) e Carajás (Cu) entre os 20 alvos prioritários.

### Fase 4: Dashboard HITL e Visualização 3D (Semanas 11-13)
- [ ] Migração do protótipo estático para aplicação SPA em **React 18 / TypeScript**:
  - Módulo de upload com validação de schema para planilhas geoquímicas (CSV/XLSX);
  - Mapa 2D interativo com Leaflet.js, renderizando heatmaps de prospectividade e alvos clicáveis;
  - Painel lateral de explicabilidade XAI renderizando gráficos interativos de contribuição de features;
  - Controles de auditoria **Human-in-the-Loop**: botões de "Aprovar Alvo", "Rejeitar Alvo (Falso Positivo)" e campo de justificativa técnica do geólogo.
- [ ] Integração do módulo de subsuperfície em **Three.js**:
  - Renderização tridimensional com controle orbital de câmera (OrbitControls);
  - Exibição de plano topográfico semitransparente, grelhas georreferenciadas e volumes elipsoidais representando hipóteses de corpos mineralizados em profundidade;
  - Nuvens de pontos ilustrando densidade preditiva.
- [ ] Exportação de laudo executivo imutável em formato PDF com metadados de auditoria e assinatura digital.

### Fase 5: Integração Completa, Active Learning e CI/CD (Semanas 14-16)
- [ ] Conexão do loop de **Active Learning**:
  - Eventos de rejeição de alvos pelo geólogo são persistidos no banco de dados com a tag `FALSO_POSITIVO`;
  - Agendamento de rotinas periódicas de retreinamento incremental do subagente associado para mitigar a repetição daquele padrão anômalo espúrio.
- [ ] Configuração de pipelines de automação CI/CD:
  - Verificação de qualidade de código, tipagem e testes unitários/integração;
  - Build e publicação automatizada de imagens Docker com tags de versão imutáveis.
- [ ] Deploy e configuração de infraestrutura em nuvem (AWS / GCP):
  - Orquestração de contêineres com escalonamento automático;
  - Monitoramento de métricas operacionais e latência de inferência (Prometheus/Grafana/CloudWatch).

### Fase 6: Validação Comercial e Pilotos de Campo (Semanas 17+)
- [ ] Execução da Prova de Conceito com dados de províncias consagradas para apresentação técnica junto à equipe de exploração da **Aura Minerals**.
- [ ] Rodadas de alinhamento com interlocutores da **Vale S.A.** e **AngloGold Ashanti**.
- [ ] Coleta de feedback de usabilidade com geólogos seniores para refinar o tempo de resposta da interface HITL e a clareza dos gráficos de explicabilidade.

---

## 5. Critérios de Aceite e Verificação Técnica

Para que um ciclo de entrega seja considerado concluído com sucesso, os seguintes testes e critérios devem ser satisfeitos:

1. **Validação de Schema Geoquímico:** O sistema rejeita graciosamente arquivos com coordenadas inválidas, colunas faltantes ou inconsistências de formatação, fornecendo mensagens de erro descritivas ao usuário.
2. **Latência de Inferência:** O Agente Orquestrador deve processar um dataset de até 10.000 pontos amostrais, gerar o ranking MAPDA e calcular os valores SHAP em **menos de 45 segundos**.
3. **Auditabilidade Estrita:** 100% dos alvos gerados possuem registro imutável no banco de dados contendo `versao_algoritmo`, `subagente_utilizado`, `seed_aleatoria` e `valores_shap_json`.
4. **Isolamento de Contêineres:** Testes automatizados de integração verificam que o contêiner do Subagente Ouro não possui conectividade de rede com o modelo ou volumes do Subagente Cobre.
5. **Responsividade 3D WebGL:** A cena tridimensional em Three.js deve manter taxa de quadros superior a **50 FPS** em hardware convencional com acelerador gráfico integrado.

---

*OrenAI — Engenharia de Software e Inteligência Artificial Aplicadas à Pesquisa Mineral Sustentável.*
