# Auditoria do MVP OrenAI / MAPDA

## Veredito

O MVP esta adequado para apresentacao comercial inicial, desde que seja apresentado como demo de fluxo e proposta, nao como modelo geologico validado.

## O Que Esta Conforme

- Interface web estatica: abre localmente sem instalacao e sem backend obrigatorio.
- Tema visual: versao light fixa, sem modo dark ativo.
- Layout: app ocupa a tela inteira e nao exibe mais a moldura falsa de navegador.
- Mapa: possui modo `Superficie 2D` em Canvas e `Subsolo 3D` em WebGL/Three.js, com controles separados das camadas `Score`, `Geoquimica` e `Risco`.
- Privacidade: upload de CSV/JSON acontece no navegador; o arquivo nao e enviado para servidor externo.
- Dependencias: biblioteca de icones esta local em `assets/lucide.min.js`.
- Marca d'agua: existe selo criptografico oculto em `backend/.mapda-seal`, sem nome do dono em texto puro.
- Dados reais: foi incluido CSV extraido de fonte publica oficial da USGS em `demo-data/orenai-usgs-soil-real-sample.csv`.

## Pontos Que Nao Devem Ser Prometidos

- Nao prometer que o MVP "acha minerio".
- Nao prometer probabilidade real de descoberta mineral.
- Nao dizer que o score MAPDA esta treinado ou validado em campo.
- Nao tratar a cena 3D como modelo geologico validado de subsuperficie; ela e uma visualizacao interativa para demonstrar a proposta.

## Como Apresentar Corretamente

Use esta frase:

> A OrenAI organiza dados geoquimicos e geoespaciais para priorizar investigacao mineral, mostrar incerteza e acelerar revisao tecnica humana.

Evite esta frase:

> A OrenAI encontra minerio automaticamente.

## Riscos Residuais

- A analise ainda e simulada.
- O dataset real incluido e de solo dos Estados Unidos, nao de area alvo brasileira.
- A tabela real da USGS usada nao traz ouro; ela traz Ag, As, Cu, Zn, Fe, Mn e coordenadas.
- Para piloto real, o produto precisa conectar fontes como SGB/GeoSGB, ANM/SIGMINE, MapBiomas, Sentinel/Landsat e datasets geoquimicos regionais.

## Resultado Da Auditoria

Status: aprovado para demo.

Condicao: deixar claro que e um MVP demonstrativo com dados reais de exemplo, mas sem modelo mineral validado.
