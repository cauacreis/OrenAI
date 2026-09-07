# Tutorial De Uso - OrenAI MAPDA MVP

## 1. Abrir A Demo

Abra o arquivo `index.html` no navegador ou use o servidor local:

```text
http://127.0.0.1:8787/
```

Para abrir direto no mapa 3D:

```text
http://127.0.0.1:8787/#subsurface
```

## 2. Entender A Tela Principal

- `Alvos priorizados`: quantidade simulada de pontos que o MAPDA colocaria na fila.
- `Anomalias fortes`: pontos com resposta geoquimica mais relevante.
- `Confianca MAPDA`: intervalo estimado para comunicar incerteza.
- `Prospectivity Score`: ranking espacial de prioridade.
- `Analise atual`: estado do dataset carregado.

## 3. Importar Um CSV

1. Clique em `Importar CSV`.
2. Escolha um dos arquivos em `demo-data`.
3. Use `orenai-demo-samples.csv` para a demo narrativa de Au/As/Cu.
4. Use `orenai-usgs-soil-real-sample.csv` para mostrar ingestao de dados reais.

O MVP le o CSV no navegador e atualiza:

- nome do dataset;
- numero de amostras;
- numero de variaveis;
- integridade estimada;
- outliers brutos;
- alvos priorizados simulados.

## 4. Rodar Analise

Clique em `Rodar analise`.

O app simula uma rodada MAPDA e atualiza:

- score;
- tabela de alvos;
- pipeline;
- texto do ultimo evento.

## 5. Usar O Mapa

Use os botoes:

- `Superficie 2D`: visao de cima do terreno.
- `Subsolo 3D`: cena WebGL interativa, com superficie translúcida, caixa de profundidade, volumes quentes e densidade interna.

No modo `Subsolo 3D`:

- arraste o mouse para girar a cena;
- use a roda do mouse para aproximar/afastar;
- mostre a superfície primeiro e depois desça visualmente para os corpos quentes;
- explique que os volumes são uma hipótese visual para apresentação, não uma interpretação geológica validada.

Use as camadas:

- `Score`: priorizacao MAPDA.
- `Geoquimica`: resposta quimica.
- `Risco`: possivel falso positivo.

## 6. Revisar Alvos

Na tabela `Alvos prioritarios por amostra`, use:

- check: confirmar alvo;
- X: rejeitar alvo;
- relogio: deixar pendente.

Essa parte demonstra HITL: Human-in-the-Loop. A decisao final continua humana.

## 7. Gerar Relatorio

1. Clique em `Gerar relatorio`.
2. Leia o resumo.
3. Clique em `Baixar .txt` para exportar o brief.

## 8. Roteiro De Apresentacao Em 2 Minutos

1. "A OrenAI nao promete achar minerio; ela prioriza investigacao."
2. "O sistema recebe CSV geoquimico/geoespacial."
3. "O MAPDA gera ranking, incerteza e pontos revisaveis."
4. "O mapa 2D mostra onde esta quente na superficie."
5. "O modo 3D abre uma leitura de subsuperficie com volumes densos, ajudando a vender a ideia de priorizacao."
6. "O geologo confirma/rejeita antes do relatorio."
7. "A proposta comercial e reduzir incerteza e acelerar triagem."

## 9. Dados Para Apresentar

Use estes arquivos:

- `demo-data/orenai-demo-samples.csv`: dataset narrativo para explicar Au, As e Cu.
- `demo-data/orenai-usgs-soil-real-sample.csv`: amostras reais de solo extraidas da USGS.
- `DATA-SOURCES.md`: origem e limites dos dados reais.
- `DADOS-MVP.md`: resumo dos dados usados pelo app, pelo mapa e pelo 3D.

Frase segura para falar:

> "Nesta demo, a OrenAI usa dados reais de solo como exemplo de ingestao e usa dados simulados para mostrar o fluxo comercial de priorizacao, revisao humana e relatorio."
