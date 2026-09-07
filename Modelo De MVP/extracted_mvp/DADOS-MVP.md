# Dados Do MVP - OrenAI MAPDA

## 1. Dados Demonstrativos

Arquivo:

```text
demo-data/orenai-demo-samples.csv
```

Uso na apresentacao:

- mostrar o fluxo comercial completo;
- explicar anomalias Au, As, Cu, Zn, Pb, Mn, Fe e Mo;
- alimentar a narrativa de ranking, confianca, revisao HITL e relatorio.

Natureza:

- dados simulados;
- bons para demonstrar proposta e interface;
- nao devem ser vendidos como resultado geologico real.

## 2. Dados Reais De Solo

Arquivo:

```text
demo-data/orenai-usgs-soil-real-sample.csv
```

Origem:

```text
USGS Data Series 801
Geochemical and Mineralogical Data for Soils of the Conterminous United States
https://pubs.usgs.gov/ds/801/
```

Campos incluidos:

- `sample_id`;
- `source_dataset`;
- `source_site_id`;
- `state`;
- `latitude`;
- `longitude`;
- `ag_mgkg`;
- `as_mgkg`;
- `cu_mgkg`;
- `zn_mgkg`;
- `fe_pct`;
- `mn_mgkg`;
- `land_cover`;
- `depth_cm`;
- `notes`.

Uso na apresentacao:

- provar que o MVP ja aceita CSV geocientifico real;
- mostrar que coordenadas e elementos quimicos entram no fluxo;
- reforcar que a OrenAI pode plugar fontes publicas e privadas.

Limite:

- esta tabela real nao contem ouro;
- por isso a historia Au/As/Cu fica no dataset demonstrativo;
- a priorizacao MAPDA ainda e simulada.

## 3. Dados Internos Do Mapa

Arquivo:

```text
app.js
```

Objetos usados:

- `targets`: amostras-alvo da demo, com score, status, posicao e fatores;
- `terrainHotspots`: hotspots espaciais, com score, geoquimica e risco;
- `scenarios`: base, exploratorio e conservador.

Uso:

- alimentar grafico de score;
- alimentar mapa 2D;
- alimentar cena 3D;
- atualizar o relatorio simulado.

## 4. Cena 3D

Arquivos:

```text
subsurface-three.js
assets/three.module.js
assets/three.core.js
assets/three-addons/controls/OrbitControls.js
```

O que a cena faz:

- cria superficie translúcida;
- cria grade geologica superior;
- cria caixa de profundidade;
- cria planos internos de profundidade;
- cria volumes elipsoidais no subsolo;
- cria nuvem de pontos para sugerir densidade interna;
- permite girar e aproximar a cena com mouse.

Frase segura:

> "O 3D representa uma hipotese visual de subsuperficie para a demo. O MVP ainda nao calcula um modelo geologico 3D validado."

## 5. O Que Ainda Falta Para Piloto Real

- dados geoquimicos brasileiros com permissao de uso;
- poligonais e processos ANM/SIGMINE;
- geologia e estruturas do SGB/GeoSGB;
- imagens Sentinel/Landsat;
- validacao de historico de deposito conhecido;
- protocolo com geologo para confirmar falso positivo e falso negativo.
