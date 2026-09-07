# OrenAI MVP - envio e apresentacao

## Como abrir

1. Abra `index.html` no navegador.
2. Clique em `Importar CSV`.
3. Escolha `demo-data/orenai-demo-samples.csv` para a demo narrativa ou `demo-data/orenai-usgs-soil-real-sample.csv` para dados reais.
4. Clique em `Rodar analise`.
5. Role ate `Mapa de calor do terreno` ou abra direto com `index.html#subsurface`.
6. Troque entre `Superficie 2D` e `Subsolo 3D`.
7. No `Subsolo 3D`, arraste com o mouse para girar e use a roda para aproximar.
8. Clique em `Gerar relatorio`.
9. No modal, clique em `Baixar .txt` se quiser enviar o resumo junto.

## Roteiro rapido da demo

1. Mostrar a tela principal: score MAPDA, confianca e alvos priorizados.
2. Explicar que o CSV simula amostras geoquimicas com coordenadas e elementos.
3. Rodar a analise para mostrar o fluxo vivo.
4. Mostrar o mapa de calor como simulacao espacial de terreno/anomalia.
5. Mostrar `Superficie 2D` e depois `Subsolo 3D` interativo com volumes de subsuperficie.
6. Trocar camadas: `Score`, `Geoquimica`, `Risco`.
7. Confirmar/rejeitar alguns alvos na tabela para mostrar revisao humana.
8. Gerar relatorio e explicar que o MVP e demonstrativo, nao modelo real treinado.

## Documentos inclusos

- `TUTORIAL-USO.md`: passo a passo de uso.
- `AUDITORIA-MVP.md`: auditoria curta de conformidade e limites.
- `DATA-SOURCES.md`: fonte do CSV real incluido.
- `DADOS-MVP.md`: resumo dos dados usados pela demo, pelo mapa e pela cena 3D.
- `REFERENCIAS-TECNICAS.md`: base tecnica usada para o 3D WebGL e fontes.
- `design-qa.md`: QA visual da tela 2D/3D.

## Como enviar para outra pessoa

1. Compacte a pasta inteira `orenai-web-preview`.
2. Envie o arquivo `.zip`.
3. A pessoa deve extrair o ZIP antes de abrir.
4. Depois de extrair, ela abre `index.html`.

Nao precisa instalar nada. O MVP e estatico: HTML, CSS, JS, imagem da logo, biblioteca de icones local, Three.js local, CSV demonstrativo e CSV real de amostra publica.
