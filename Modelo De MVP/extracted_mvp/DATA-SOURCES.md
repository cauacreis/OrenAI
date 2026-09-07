# Fontes De Dados

## Dataset Real Incluido

Arquivo:

```text
demo-data/orenai-usgs-soil-real-sample.csv
```

Fonte:

```text
USGS Data Series 801 - Geochemical and Mineralogical Data for Soils of the Conterminous United States
https://pubs.usgs.gov/ds/801/
```

Arquivo original usado:

```text
https://pubs.usgs.gov/ds/801/downloads/Appendix_2b_Top5_18Sept2013.txt
```

## O Que Foi Extraido

Foram extraidas 64 amostras reais de solo superficial, profundidade `0-5 cm`, com:

- latitude;
- longitude;
- estado;
- cobertura do solo;
- Ag;
- As;
- Cu;
- Zn;
- Fe;
- Mn.

## Adaptacao Para O MVP

O arquivo foi convertido para CSV limpo e pequeno para ser usado na demo da OrenAI.

Importante:

- Os valores geoquimicos sao reais.
- A priorizacao MAPDA exibida no app ainda e simulada.
- A tabela USGS DS801 usada nao contem ouro; por isso a narrativa Au/As/Cu continua demonstrativa no dataset original `orenai-demo-samples.csv`.

## Dados Da Visualizacao 3D

A cena `Subsolo 3D` usa os objetos internos `targets` e `terrainHotspots` do arquivo `app.js`.

Ela transforma esses pontos em:

- superficie translúcida;
- grid superior;
- caixa de profundidade;
- planos internos;
- volumes elipsoidais;
- nuvem de pontos para sugerir densidade.

Isso melhora a apresentacao da hipotese espacial, mas ainda nao substitui uma modelagem geologica 3D real baseada em sondagem, inversao geofisica ou voxels calibrados.

## Proximas Fontes Para Um Piloto Brasileiro

- SGB / GeoSGB: geologia, geoquimica e produtos geocientificos.
- ANM / SIGMINE: processos minerarios e poligonais.
- MapBiomas: uso/cobertura do solo e mineracao.
- Sentinel / Landsat: sensoriamento remoto.
- USGS: base geocientifica internacional para benchmark.
