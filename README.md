# ZUBIRI AI Learning Lab — Aprendizaje visible (v2.2)

Tres laboratorios educativos en castellano, autónomos y listos para GitHub Pages:

1. **Aprendizaje supervisado:** regresión lineal con descenso del gradiente y datos sintéticos de siete piezas conocidas. Incluye tres observaciones reservadas para test, selección de ciclos, tasa de aprendizaje, curva de pérdida, predicción de una nueva pieza y esquema de pinza.
2. **Aprendizaje no supervisado:** K-means real sobre **21 piezas**, con 2, 3 o 4 agrupaciones; la misión es clasificar antes de construir un castillo. Incluye asignación, actualización de centroides, agrupación en bandejas y castillo ilustrativo para tres grupos.
3. **Aprendizaje por refuerzo:** tres en raya con **Q-learning tabular** para el robot (O). Practica contra jugadores simulados de tres niveles, muestra pérdidas en un dashboard basado en evaluaciones sin entrenar y permite jugar contra el agente y actualizar Q con las partidas de visitantes. El visitante siempre juega con X y empieza; contra un X óptimo, O solo puede aspirar a tablas.

## Uso local

Abre `index.html` con un navegador moderno. No usa servicios externos ni bibliotecas de terceros. Mantén la carpeta `assets` junto a los archivos `.html`.

## Publicación en GitHub Pages

1. Crea un repositorio, por ejemplo `zubiri-ai-learning-lab`.
2. Sube **el contenido de esta carpeta**, sin una carpeta adicional intermedia, de modo que `index.html` esté en la raíz del repositorio y `assets` a su lado.
3. Ve a **Settings → Pages → Build and deployment** y selecciona **Deploy from a branch**, rama **main** y carpeta **/(root)**.
4. Abre la URL que GitHub Pages indique tras publicar. Si el repositorio se llama como en el ejemplo, normalmente será `https://USUARIO.github.io/zubiri-ai-learning-lab/`.

## Sugerencia para una demostración de 7 minutos

- **Supervisado:** abrir los datos de entrada, mostrar la recta en la ciclo 0 y al final, probar una pieza nueva. Distinguir datos train/test.
- **No supervisado:** avanzar una asignación y una actualización de centroides; pulsar «Converger» y observar las bandejas y el castillo ilustrativo.
- **Refuerzo:** jugar antes de entrenar, entrenar 200 + 1000 + 5000 partidas, observar el dashboard de derrotas por nivel y volver a jugar.

## Precisión metodológica

- Las mediciones de pinza son **datos sintéticos**, no una calibración industrial. La regresión predice una apertura de referencia que requeriría validación independiente antes de manipulación real.
- K-means agrupa medidas geométricas, pero **no diseña ni asegura la estabilidad** de un castillo; la secuencia de construcción sería un plan externo.
- Q-learning aprende valores de acciones en tableros discretos. El entrenamiento incluye **rival aleatorio**, **rival intermedio heurístico** y **rival experto minimax**. El dashboard usa nuevas partidas sin actualización de Q. Los resultados no están prefijados.
- Con el primer movimiento de X, contra un jugador perfecto **el mejor resultado del robot O es empatar**. Los resultados de este prototipo no constituyen una garantía formal de invencibilidad.
- Ninguno de los tres laboratorios controla el robot UR3e. Un prototipo físico exigiría percepción/calibración, movimientos predefinidos y evaluación de riesgos, funciones de seguridad y validación independiente de los algoritmos educativos.

## Tecnologías

HTML5, CSS3 y JavaScript sin dependencias. Archivos:

- `index.html`: portada.
- `supervisado.html` y `assets/supervisado.js`: descenso del gradiente.
- `no_supervisado.html` y `assets/no_supervisado.js`: K-means.
- `refuerzo.html`, `assets/tictactoe_engine.js` y `assets/refuerzo.js`: Q-learning para tres en raya.
- `assets/site.css`: diseño claro y adaptable a móviles.

Los archivos están preparados para usarse como material educativo en el marco de ZUBIRI AI Learning Lab.


## Novedades de v2.2

- Recorrido guiado «Antes → Durante → Después» en las tres experiencias; los algoritmos se ejecutan realmente y pueden manipularse fuera del recorrido.
- Regresión: conjunto de validación separado y test final reservado hasta que se pulse «Evaluar modelo elegido»; aviso al explorar una medida fuera del rango de entrenamiento. Un test consultado deja de ser test independiente si se utiliza para volver a elegir parámetros.
- K-means: identificación de cada una de las 21 piezas entre gráfico y bandejas y un dataset alternativo con agrupaciones menos evidentes.
- Q-learning: evaluación sin crear nuevos estados Q, contador de estados aprendidos, panel con la última actualización Q real (anterior/objetivo/nuevo), dashboard actualizado después de partidas humanas, eje conjunto de experiencias simuladas y humanas.

No hay motores gráficos ni control de UR3e. Todos los modelos y mediciones son educativos e ilustrativos.

## Correcciones de v2.2

- Textos visibles de la sección supervisada: «ciclo» y «ciclos» en lugar de «época» y «épocas».
- Se elimina el párrafo de advertencia largo sobre invencibilidad en la interfaz del tres en raya; la precisión metodológica sigue documentada en este README.
- Se resalta también la diagonal de derecha a izquierda (casillas 3, 5 y 7) en las victorias tanto de X como de O.
