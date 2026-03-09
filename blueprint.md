# Proyecto Advance Group: Blueprint de Aplicación

## 1. Visión General del Proyecto

Este documento detalla la arquitectura, características y plan de desarrollo para la página web corporativa de **Advance Group**. La aplicación es una "Single Page Application" (SPA) construida con React y estilizada con Tailwind CSS. Su propósito es servir como una moderna y atractiva tarjeta de presentación digital que comunique claramente la propuesta de valor de la compañía, su ecosistema de servicios y facilite el contacto para la generación de alianzas comerciales.

## 2. Esquema Detallado de la Aplicación

A continuación, se desglosan los componentes, estilos y funcionalidades implementadas hasta la fecha.

### 2.1. Diseño y Estilo (Styling)

*   **Framework CSS:** Se utiliza **Tailwind CSS** para un enfoque "utility-first" que permite un desarrollo rápido y un diseño consistente.
*   **Paleta de Colores Corporativa:**
    *   Naranja Principal (Accent): `#F37021`
    *   Gris Logístico: `#939598`
    *   Azul Marino (Depot): `#1A237E`
    *   Teal (Solutions): `#4DB6AC`
*   **Tipografía:** Se usa la familia de fuentes `sans-serif` por defecto, con un fuerte énfasis en la jerarquía visual a través de diferentes grosores de fuente (e.g., `font-black`) y tamaños.
*   **Animaciones y Transiciones:** Se ha instalado y configurado `tailwindcss-animate` para animaciones sutiles en la carga de elementos (`fade-in`, `slide-in-from-left`) y en las interacciones del usuario (`hover`).
*   **Diseño Responsivo:** La aplicación está diseñada para ser completamente funcional y estéticamente agradable tanto en dispositivos móviles como en escritorio.

### 2.2. Arquitectura de Componentes (React)

La aplicación se estructura en un componente principal `App.jsx` que gestiona el estado de la navegación y la visibilidad de las diferentes secciones y modales.

*   **Navegación:**
    *   **Barra de Navegación (`<nav>`):** Fija en la parte superior, con un efecto de desenfoque de fondo (`backdrop-blur`). Contiene el logo, enlaces a las secciones principales (Inicio, Ecosistema, Contacto) y un botón de "Cotizar ahora".
    *   **Gestión de Estado de Sección:** Un estado de React (`activeSection`) controla qué sección principal se muestra al usuario, simulando una navegación de página sin recargar.

*   **Secciones Principales:**
    1.  **Sección Hero (`#home`):**
        *   Presenta el eslogan principal con un fuerte impacto visual.
        *   Incluye un párrafo descriptivo y CTAs (Call to Action) claros para explorar soluciones.
        *   Muestra una imagen destacada con un diseño de tarjeta superpuesta.
    2.  **Sección de Líneas de Negocio:**
        *   Muestra las tres divisiones de la empresa (Logistics, Depot, Solutions) en un formato de cuadrícula (`grid`).
        *   Cada tarjeta es interactiva y lleva al usuario a la sección de servicios, filtrando por la línea de negocio seleccionada.
    3.  **Sección de Industrias:**
        *   Destaca la versatilidad de la empresa mostrando las industrias a las que sirve dentro de un contenedor con fondo oscuro para crear contraste.
    4.  **Marketplace de Servicios (`#services`):**
        *   Funciona como un "ecosistema" donde el usuario puede explorar todos los servicios ofrecidos.
        *   **Funcionalidad de Búsqueda:** Permite buscar servicios por título o descripción.
        *   **Funcionalidad de Filtro:** Permite filtrar servicios por línea de negocio (`all`, `logistics`, `depot`, `solutions`).
        *   Al hacer clic en un servicio, se abre un modal de detalle.
    5.  **Sección de Contacto (`#contact`):**
        *   Contiene la información de contacto principal.
        *   Presenta un **formulario de solicitud de alianza** para la captación de clientes potenciales.
        *   El formulario tiene estados visuales para `submitting` y `success`.

*   **Componentes Reutilizables y Modales:**
    *   **`LogoSVG`:** Un componente de logo en formato SVG que permite la personalización del color de acento.
    *   **Modal de Detalle de Servicio:**
        *   Se activa al seleccionar un servicio del marketplace.
        *   Muestra información detallada sobre el servicio seleccionado.
        *   **Funcionalidad de Venta Cruzada (Cross-selling):** Muestra una lista de servicios relacionados para fomentar una solución integral (360°), permitiendo al usuario navegar entre servicios sin cerrar el modal.

*   **Footer:**
    *   Incluye información resumida de la empresa, el logo y enlaces a redes sociales.

### 2.3. Plan de Implementación Actual (Completado)

El objetivo de la fase inicial fue replicar fielmente el diseño y la funcionalidad concebidos en la plataforma Gemini. Las siguientes tareas se completaron para lograrlo:

1.  **Análisis del Diseño:** Se estudió el diseño de Gemini para identificar componentes, estructura, paleta de colores y funcionalidades interactivas.
2.  **Andamiaje del Proyecto:** Se estructuró el código en un único componente `App.jsx` y se definieron las constantes de la marca (colores, líneas de negocio, servicios).
3.  **Instalación de Dependencias:** Se añadió `lucide-react` para la iconografía.
4.  **Corrección de Configuración de Tailwind CSS:**
    *   Se detectó que los estilos de Tailwind no se aplicaban correctamente.
    *   Se creó y configuró `postcss.config.js`.
    *   Se creó `src/index.css` para importar las directivas de Tailwind.
    *   Se actualizó `src/main.jsx` para importar el nuevo archivo CSS.
5.  **Integración de Animaciones:**
    *   Se instaló la dependencia `tailwindcss-animate`.
    *   Se actualizó `tailwind.config.js` para incluir el plugin y habilitar las clases de animación utilizadas en el JSX.
6.  **Verificación Final:** Se comprobó que el resultado en el preview de Firebase Studio coincidiera con el diseño de referencia, asegurando que todos los estilos, animaciones e interacciones funcionaran como se esperaba.
