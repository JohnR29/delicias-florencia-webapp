# Delicias Florencia - Página Web

Sitio estático optimizado para mostrar sabores de tortas en vaso, precios escalados y permitir una cotización rápida vía correo (mailto). Refactorizado para buenas prácticas de accesibilidad, mantenibilidad y rendimiento ligero.

## Características

- **Diseño Responsivo**: Se adapta perfectamente a todos los dispositivos
- **Galería de Sabores**: Muestra los sabores disponibles con fotos atractivas
- **Sistema de Precios**: Precios escalonados según cantidad
- **Cotización Rápida**: Selección de sabores y cantidades con resumen dinámico
- **Zonas de Cobertura**: Información clara sobre las áreas de entrega
- **Optimizada para Conversión**: Diseñada para generar más ventas

## Sabores Disponibles (data centralizada en `script.js`)

- Piña Crema
- Oreo
- Tres Leches
- Selva Negra

## Reglas de Precios

- 6 a 14 unidades: $1.650 c/u
- 15 o más unidades: $1.500 c/u (mayorista)
- Se pueden combinar sabores para alcanzar mayorista

Constantes en `script.js`:
```js
const MINIMO_PEDIDO = 6;
const UMBRAL_MAYORISTA = 15;
const PRECIO_NORMAL = 1650;
const PRECIO_MAYORISTA = 1500;
```

## Zonas de Cobertura

Región Metropolitana:
- San Bernardo
- La Pintana
- El Bosque
- La Cisterna

## Uso / Instalación

1. Clonar repositorio.
2. Colocar recursos de imágenes en la raíz:
   - `logo-delicias-florencia.png`
   - `torta1.jpg` (hero) + imágenes por sabor (`tres-leches.jpg`, `selva-negra.jpg`, `oreo.jpg`, `pina-crema.jpg`).
3. Abrir `index.html` en navegador (no requiere servidor).

Opcional: servir localmente para pruebas de caché / performance:
```
python -m http.server 8080
```

## Personalización

### Cambiar Email de Contacto

Editar constante en `script.js`:
```js
const EMAIL_DESTINO = 'tucorreo@ejemplo.com';
```

### Añadir un nuevo sabor

1. Agregar objeto al array `saboresData` en `script.js` (mantener keys únicas):
```js
{ key: 'nuevo-sabor', nombre: 'Nuevo Sabor', precio: PRECIO_MAYORISTA, ingredientes: ['...'] }
```
2. Duplicar bloque de tarjeta en sección Cotizar (`index.html`) con `data-sabor="nuevo-sabor"`.

### Accesibilidad
- Navegación móvil con `aria-expanded`.
- Botones + / - con `aria-label`.
- Región de resumen con actualización en vivo (`aria-live`).
- Clase utilitaria `.visually-hidden` disponible.

### Mejoras Futuras (Ideas)
- Persistir carrito en `localStorage`.
- Backend ligero (form submit) para reemplazar mailto.
- Soporte de alérgenos en datos de sabores.
- Generación dinámica de tarjetas desde datos JS para evitar duplicación.

---
Refactor 2025: Limpieza de código muerto, centralización de constantes, mejoras de accesibilidad y optimizaciones menores.