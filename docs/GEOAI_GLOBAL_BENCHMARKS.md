# OrenAI — Benchmarks Globais em GeoAI & Prospecção Mineral 🌐⛏️
**Catálogo de Laboratórios Mundiais, Repositórios Open-Source, Bases de Dados e Referências Científicas**

---

## 1. Laboratórios e Centros de Pesquisa de Vanguarda

Os seguintes centros acadêmicos e governamentais lideram globalmente a pesquisa em Inteligência Artificial aplicada à Geologia Econômica, Mapeamento de Prospectividade Mineral (MPM) e *Human-in-the-Loop* (HITL):

1. **Stanford Mineral-X (Stanford University, EUA)**
   - **Foco:** Mapeamento preditivo tridimensional, mitigação de incerteza em minerais críticos da transição energética e colaboração com grandes mineradoras mundiais.
   - **Website:** [mineralx.stanford.edu](https://mineralx.stanford.edu/)
2. **MinXAI Lab (Carleton University, Canadá)**
   - **Foco:** Pesquisas dedicadas exclusivamente a algoritmos de Inteligência Artificial Explicável (XAI) para geociências e modelagem prospectiva de depósitos de ouro e sulfetos maciços.
   - **Website:** [minxai.ca](https://minxai.ca/)
3. **Geological Survey of Finland - GTK (Finlândia)**
   - **Foco:** Pioneiros no desenvolvimento e liberação em código aberto de pipelines de Machine Learning para processamento de rasters geofísicos e anomalias de solo em escala continental.
   - **Website:** [gtk.fi](https://www.gtk.fi/en/)
4. **EarthByte Group (University of Sydney, Austrália)**
   - **Foco:** Frameworks de Deep Learning semi-supervisionado aplicados à modelagem espaço-temporal de províncias minerais e elementos de terras raras (REE).
   - **Website:** [earthbyte.org](https://www.earthbyte.org/)

---

## 2. Repositórios e Códigos Abertos de Referência (GitHub)

Repositórios de referência técnica para benchmarking do motor preditivo MAPDA da OrenAI:

- **`MinersAI/geochemical_anomaly_detection`**
  - Métodos modernos para detecção de anomalias geoquímicas multivariadas (*Isolation Forests*, *Autoencoders*, *Local Outlier Factor*).
  - [Acessar Repositório](https://github.com/MinersAI/geochemical_anomaly_detection)
- **`EarthByte/MPM_Curnamona_REE` (Deep-SEAM Framework)**
  - Pipeline de Deep Learning interpretável para mapeamento prospectivo de Terras Raras na província de Curnamona, com restrições geológicas incorporadas.
  - [Acessar Repositório](https://github.com/EarthByte/MPM_Curnamona_REE)
- **`ChengYeung1222/3DMPM`**
  - Mapeamento prospectivo tridimensional combinando modelos geológicos de blocos com Redes Neurais Convolucionais (3D-CNN).
  - [Acessar Repositório](https://github.com/ChengYeung1222/3DMPM)
- **`RichardScottOZ/mineral-exploration-machine-learning`**
  - Curadoria global (*Awesome List*) com papers, tutoriais e repositórios em Machine Learning aplicado à exploração mineral.
  - [Acessar Repositório](https://github.com/RichardScottOZ/mineral-exploration-machine-learning)

---

## 3. Bases de Dados Públicas para Validação (*Data Bootstrap*)

| Instituição | Base de Dados / Serviço | Aplicação na OrenAI |
| :--- | :--- | :--- |
| **CPRM / SGB (Brasil)** | *GeoBank* / *GeoSGB* | Teores geoquímicos históricos de sedimentos e solos, mapas litológicos e lineamentos estruturais. |
| **ANM (Brasil)** | *SIGMINE* | Polígonos de requerimentos e concessões de lavra ativas (verdade de campo para validação por re-descoberta). |
| **CODEMGE (MG)** | Levantamentos Aerogeofísicos | Rasters regionais de magnetometria e gamaespectrometria (canais K, Th, U) para ensemble espacial. |
| **USGS (EUA)** | *Data Series 801 (DS-801)* | Base geoquímica padronizada continental com teores de mais de 40 elementos em solos (utilizada no MVP de demonstração). |
| **ESA (Europa)** | *Sentinel-2 (Copernicus)* | Bandas multiespectrais (VNIR/SWIR) a 10m/20m para cálculo de índices de minerais hidrotermais (argilominerais, óxidos de ferro). |
| **NASA / USGS** | *SRTM / ASTER GDEM* | Modelos Digitais de Elevação para análise geomorfológica e extração de drenagens estruturais. |

---

## 4. Estado da Arte Científico e Fundamentação Metodológica

A arquitetura da OrenAI apoia-se em quatro pilares metodológicos consolidados na literatura científica recente:

1. **Stacking Ensemble em MPM:** A combinação de modelos baseados em árvores (*Gradient Boosting / LightGBM*) para dados tabulares com Redes Convolucionais (*U-Net / ResNet*) para tensores geofísicos supera abordagens monocromáticas em estabilidade preditiva (*Zuo et al., 2024; Dong et al., 2024*).
2. **Explicabilidade Matemática com SHAP (*SHapley Additive exPlanations*):** Fundamentado na teoria dos jogos cooperativos de Lloyd Shapley, o algoritmo SHAP quantifica o impacto marginal exato de cada variável de entrada (teor de Cu, razão As/Fe, proximidade a falhas), eliminando a opacidade de "caixa-preta" (*Lundberg & Lee; Zuo et al., 2024*).
3. **Aprendizado Ativo e Soberania Humana (*Human-in-the-Loop*):** Em domínios de escassez crítica de rótulos (*positive-unlabeled learning*), a intervenção do especialista humano melhora o modelo iterativamente através do descarte de falsos positivos induzidos por contaminação de superfície (*Monarch, 2021; Caers, 2024*).
4. **Resolução de Escassez de Alvos:** Depósitos minerais econômicos representam singularidades estatísticas na crosta terrestre; o framework combina modelos semi-supervisionados e balanceamento amostral (*SMOTE / Focal Loss*) para contornar o severo desbalanceamento de classes.
