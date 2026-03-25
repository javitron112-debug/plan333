# Plan 3-3-3 | Coordinación de Emergencias

Panel central informativo y herramienta de supervivencia diseñada para escenarios de colapso de redes de telecomunicaciones. Esta aplicación web funciona como una **PWA (Progressive Web App)** instalable y con soporte offline, garantizando el acceso a información crítica cuando no hay conexión a internet.

## 🚀 Características Principales

* **Protocolo 3-3-3 (Radiocomunicaciones):** Guía detallada y tabla de horarios dinámicos (calculados según tu zona horaria) para optimizar el uso de baterías en equipos de radio PMR-446 y CB-27.
* **Mapa de Recursos Críticos (1.5 km):** Localizador basado en OpenStreetMap (vía Nominatim y Overpass API) que muestra hospitales, policía, bomberos, centros cívicos y bases de rescate en un radio seguro a pie.
* **Mochila 72H (Checklist):** Lista interactiva dividida por categorías (Agua, Salud, Energía, etc.) con barra de progreso. El estado se guarda automáticamente en el dispositivo mediante `localStorage`.
* **Guía de Primeros Auxilios:** Instrucciones clave adaptadas por edad (Adultos, Niños, Lactantes) para RCP, Maniobra de Heimlich y control de hemorragias severas.
* **Soporte Offline:** Service Worker integrado que cachea la estructura web y permite navegar por el protocolo, la mochila y las guías médicas sin conexión a la red.
* **Modo Claro / Oscuro:** Interfaz adaptativa integrada con Tailwind CSS.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Estilos:** Tailwind CSS (vía CDN) con variables CSS nativas para el control de temas.
* **Mapas:** Leaflet.js.
* **APIs Externas:** Nominatim (Geocodificación) y Overpass API (Búsqueda de puntos de interés).

## 📂 Estructura de Archivos

El proyecto está diseñado en una arquitectura *Single Page Application* (SPA) minimizada:

* `index.html`: Contiene toda la estructura visual, el diseño, los textos y la lógica de navegación e interacción (JS).
* `manifest.json`: Archivo de configuración que permite que los dispositivos móviles reconozcan la web como una aplicación instalable.
* `sw.js`: Service Worker encargado de gestionar la caché estática, permitiendo el funcionamiento sin internet y generando dinámicamente los iconos de la aplicación.
* `rcp.jpg` *(Requerido)*: Imagen infográfica para la sección de primeros auxilios.

## ⚙️ Instalación y Uso

1.  **Uso local:** Clona el repositorio. Para que el Service Worker se registre correctamente, debes servir los archivos a través de un servidor local (por ejemplo, usando `Live Server` en VSCode o `python -m http.server`).
2.  **Producción:** Sube los archivos a cualquier servicio de hosting estático con soporte HTTPS (como GitHub Pages o Vercel).
3.  **Instalación PWA:** Al abrir la web desde un navegador móvil compatible (Chrome, Safari), aparecerá un botón o un aviso en el navegador permitiendo "Añadir a la pantalla de inicio".

## ⚖️ Aviso Legal

Esta aplicación es de carácter estrictamente informativo y educativo. La información proporcionada no sustituye en ningún caso el asesoramiento médico profesional, la formación en primeros auxilios ni las instrucciones de los servicios de emergencia oficiales (112). El uso de esta plataforma, de sus mapas y de sus guías se realiza bajo la exclusiva responsabilidad y riesgo del usuario.
