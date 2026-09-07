# OrenAI 🌍⛏️
**Plataforma SaaS B2B de Mapeamento de Prospectividade Mineral (MPM) baseada em Arquitetura Multi-Agentes (MAS)**

[![Status](https://img.shields.io/badge/Status-Fase%2001%20(4º%20Período)-blue.svg)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Multi--Agent%20(MAS)%20%7C%20MoE-purple.svg)](#)
[![XAI](https://img.shields.io/badge/Explainability-SHAP-success.svg)](#)
[![HITL](https://img.shields.io/badge/Human--in--the--Loop-Active%20Learning-orange.svg)](#)
[![3D](https://img.shields.io/badge/3D%20Visualization-Three.js-black.svg)](#)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary%20%7C%20All%20Rights%20Reserved-red.svg)](LICENSE)

---

## 💡 O que é a OrenAI?

A **OrenAI** é um software B2B SaaS que utiliza Inteligência Artificial para indicar matematicamente a empresas mineradoras **ONDE perfurar o solo com máxima precisão**, atuando na fase crítica de pesquisa mineral **ANTES** de qualquer perfuração testemunhada.

- **O Problema:** A exploração mineral global consome mais de **US$ 12 bilhões ao ano**, registrando uma taxa histórica de insucesso de **99% em furos de sondagem** (*MinEx Consulting / S&P Global*). Cada furo estéril ("furo seco") custa mais de **US$ 100.000**.
- **A Solução:** Redução drástica de furos secos através de um **Sistema Multi-Agentes (MAS)** sob o padrão **Mixture of Experts (MoE)**, combinando aprendizado de máquina preditivo (Módulo MAPDA), explicabilidade algorítmica (SHAP) e uma interface com visualização 3D de subsuperfície em **Three.js** e soberania humana (**Human-in-the-Loop**).
- **Escopo Estrito:** O software **NÃO** opera sondas mecânicas, **NÃO** realiza lavra física e **NÃO** substitui o geólogo. O geólogo humano valida, aprova ou rejeita alvos ranqueados matematicamente.

---

## 🏗️ Arquitetura do Sistema

A OrenAI organiza-se em 5 camadas modulares e desacopladas:

![Arquitetura de Solução Multi-Agentes](assets/diagrams/diagrama_arquitetura_mas_moe.png)

1. **Camada de Apresentação HITL:** Dashboard SPA em React 18, TypeScript, Tailwind CSS, mapas 2D interativos com Leaflet e visualização 3D de subsuperfície com **Three.js** (nuvens de pontos e volumes elipsoidais de corpos mineralizados).
2. **Camada de Orquestração & Gateway:** FastAPI assíncrono e **Agente Gestor Orquestrador** com classificação semântica de intenções (*Intent Classification*). O Orquestrador liga e desliga subagentes especialistas sob demanda para minimizar custos de nuvem.
3. **Camada de Especialistas (MoE em Docker):** Contêineres Docker independentes para cada commodity (*Subagente Cobre Pórfiro*, *Subagente Ouro Epitermal*, extensível para Lítio, Nióbio, etc.) com **isolamento estrito de pesos**.
4. **Camada de Inteligência (MAPDA Ensemble & XAI):**
   - **MAPDA Tabular:** Gradient Boosting (*XGBoost / LightGBM*) para concentrações geoquímicas (ppm/ppb) e razões de elementos indicadores (*pathfinders*);
   - **MAPDA Espacial:** Redes Neurais Convolucionais (*CNN / U-Net*) para rasters geofísicos e imagens *Sentinel-2*;
   - **Módulo XAI (SHAP):** Explicabilidade individual de 100% dos alvos (*"Cu_ppm contribuiu com 42% para este alvo"*), eliminando qualquer aspecto de caixa-preta.
5. **Camada de Dados & Data Bootstrap:** PostgreSQL 16 + PostGIS normalizado em 3FN e pipeline de dados abertos governamentais (*CPRM GeoBank/GeoSGB, ANM SIGMINE, CODEMGE, USGS DS801*).

---

## 🔄 Fluxo Operacional e Active Learning

![Fluxo Operacional Multi-Agentes](assets/diagrams/diagrama_fluxo_multiagente.png)

1. **Entrada:** Geólogo envia dados geoquímicos e seleciona o alvo;
2. **Orquestração:** Agente Gestor identifica a intenção e inicializa o subagente correto;
3. **Especialista:** Subagente Dockerizado isolado processa os dados com pesos dedicados;
4. **Predição MAPDA:** Ensemble tabular + espacial calcula o score de confiança e heatmap;
5. **Explicabilidade XAI:** SHAP decompõe a contribuição matemática de cada atributo;
6. **Interface HITL (2D & 3D):** Geólogo inspeciona alvos no mapa 2D e modelo 3D em Three.js, aprovando ou rejeitando;
7. **Active Learning:** Alvos rejeitados retornam ao Agente Gestor para retreinamento incremental do subagente.

---

## 🔒 As 6 Regras de Ouro

1. **A IA NUNCA toma a decisão final:** O geólogo humano tem a soberania final (*Human-in-the-Loop*).
2. **A IA NUNCA é caixa-preta:** Toda predição tem decomposição matemática transparente (*SHAP*).
3. **Subagentes NUNCA compartilham pesos:** Silos 100% isolados entre commodities minerais.
4. **Data Bootstrap governamental aberto:** A PoC valida-se com dados abertos da CPRM, ANM e USGS.
5. **Custo de nuvem minimizado por arquitetura:** Subagentes são ativados estritamente sob demanda.
6. **Modularidade plug-and-play:** Novos subagentes são adicionados como contêineres sem refatorar a base.

---

## 📁 Estrutura do Repositório

```text
OrenAI/
├── .gitignore                      # Configuração de arquivos ignorados
├── README.md                       # Documentação principal e visão geral
├── OrenAI_Pitch_Deck.html          # Apresentação executiva interativa
├── Pitch_OrenAI_Final.pptx         # Apresentação em slides PowerPoint
├── assets/
│   └── diagrams/                   # Diagramas em alta resolução (300 DPI)
│       ├── diagrama_arquitetura_mas_moe.png
│       ├── diagrama_fluxo_multiagente.png
│       └── diagrama_der_logico.png
├── docs/                           # Documentação técnica e acadêmica
│   ├── ARCHITECTURE.md             # Especificação arquitetural de engenharia MAS
│   ├── Documento de Especificação do Projeto Integrador.docx # Documento Word oficial
│   └── Documento_de_Especificacao_OrenAI_Fase01_4Periodo.pdf # Laudo diagramado em PDF
└── Modelo De MVP/                  # Protótipos funcionais
    ├── extracted_mvp/              # Código do protótipo web
    └── orenai-mapda-mvp-three-...zip # Protótipo demonstrativo com Three.js
```

---

## 🚀 Como Iniciar

1. **Explorar a Especificação Completa:**
   - Consulte [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para aprofundar na engenharia do sistema multiagente.
   - Consulte o laudo acadêmico oficial em [`docs/Documento_de_Especificacao_OrenAI_Fase01_4Periodo.pdf`](docs/Documento_de_Especificacao_OrenAI_Fase01_4Periodo.pdf).
2. **Visualizar os Diagramas de Engenharia:**
   - [Diagrama de Arquitetura Multi-Agentes](assets/diagrams/diagrama_arquitetura_mas_moe.png)
   - [Diagrama de Atividades e Fluxo HITL](assets/diagrams/diagrama_fluxo_multiagente.png)
   - [Modelo Lógico de Dados DER (3FN)](assets/diagrams/diagrama_der_logico.png)
3. **Protótipo 3D:**
   - Navegue até `Modelo De MVP/extracted_mvp/` para interagir com a renderização de subsuperfície com Three.js.

---

## 👥 Equipe de Desenvolvimento

- **Cauã Felype:** Líder Técnico & Arquiteto de Software / MAS
- **Gabryel Rodrigues:** Engenheiro de Machine Learning / MAPDA & XAI
- **Roger Prado:** Engenheiro de Dados & Requisitos Geológicos
- **Rafael Farias:** Engenheiro de Frontend & Visualização 3D (Three.js)

---

## 📜 Licença e Propriedade Intelectual

Este projeto é protegido por **Licença Proprietária (Source-Available / Todos os Direitos Reservados)**.

- O repositório é público **exclusivamente para fins de visualização, auditoria acadêmica e demonstração de competência técnica**.
- **É expressamente PROIBIDA** a cópia, redistribuição, engenharia reversa, implantação operacional ou uso comercial deste código-fonte, arquitetura multiagente e modelos de IA por terceiros para proveito próprio sem autorização expressa e por escrito dos autores.
- Para maiores detalhes, consulte o arquivo [LICENSE](LICENSE).

---
*OrenAI — Engenharia de Software aplicada à Geotecnologia e Pesquisa Mineral.*
