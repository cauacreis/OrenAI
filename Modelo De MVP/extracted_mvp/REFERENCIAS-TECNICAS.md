# Referencias Tecnicas - OrenAI MAPDA MVP

## 1. Visualizacao 3D

Biblioteca usada:

```text
Three.js
https://threejs.org/docs/
```

Recursos aplicados no MVP:

- `WebGLRenderer`: renderizacao 3D acelerada por WebGL dentro do navegador.
- `OrbitControls`: interacao de camera para girar, aproximar e explorar a cena.
- `PlaneGeometry`: superficie superior e planos internos de profundidade.
- `SphereGeometry`: volumes elipsoidais de subsuperficie.
- `PointsMaterial`: nuvem de pontos para representar densidade interna.
- `MeshPhysicalMaterial`: materiais translúcidos para dar profundidade visual.

Arquivos locais:

```text
assets/three.module.js
assets/three.core.js
assets/three-addons/controls/OrbitControls.js
subsurface-three.js
```

## 2. Logica Visual Do Subsolo

A cena 3D nao usa um modelo geologico real. Ela usa uma logica demonstrativa:

1. `terrainHotspots` define regioes quentes.
2. Cada hotspot vira um corpo elipsoidal no subsolo.
3. O score/camada controla tamanho, cor e densidade.
4. Pontos internos simulam concentracao/densidade.
5. Planos transparentes e caixa de profundidade dão leitura espacial.

Essa logica e adequada para apresentar a proposta do MVP, mas nao substitui modelagem 3D baseada em sondagem ou geofisica.

## 3. Dados Reais

Fonte usada:

```text
USGS Data Series 801
https://pubs.usgs.gov/ds/801/
```

Uso:

- dataset publico de solo;
- coordenadas reais;
- elementos reais;
- prova de ingestao de CSV geocientifico.
