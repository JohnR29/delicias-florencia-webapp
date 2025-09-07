# Delicias Florencia - Página Web

Sitio estático ligero para presentar tortas en vaso, precios escalonados y cotización rápida vía correo (`mailto:`). Optimizado para conversión, accesibilidad y mantenimiento simple (solo HTML/CSS/JS sin build).

## 🆕 Principales mejoras recientes
- Reemplazo de grilla estática de precios por tarjetas dinámicas generadas desde constantes (evita duplicación).
- Nuevo esquema de 3 tramos (antes 2): 6–14 / 15–19 / 20+ con ahorros mostrados (monto y %).
- Destacado visual automático del mejor precio (tramo 20+), badge y color con enfoque de marketing.
- Línea de social proof: “Más del 60% elige 20+ unidades”.
- Upsell contextual en el resumen de pedido (“Agrega X más y baja a…”).
- Flujos accesibles: `aria-live`, labels explícitos, navegación móvil con estado.
- Código depurado: funciones de render centralizadas y constantes únicas.

## Características
- **Responsive** (mobile-first adaptativo).
- **Sabores dinámicos**: datos centralizados en `script.js` (`saboresData`).
- **Precios escalonados dinámicos**: tarjetas renderizadas desde constantes (sin tocar HTML para cambiar precios).
- **Resumen y cálculo instantáneo**: precio unitario, total y sugerencias de ahorro.
- **Cobertura geográfica visual**: mapa Leaflet + unión simplificada de polígonos.
- **Accesibilidad básica**: roles, `aria-*`, foco visible, preferencia reduce motion respetada.
- **Marketing**: social proof + destaque del tramo óptimo.

## Sabores disponibles
Definidos en `saboresData` (archivo `script.js`):
- Piña Crema
- Oreo
- Tres Leches
- Selva Negra

Agregar uno nuevo implica solo editar ese array (ver abajo).

## Reglas de precios actuales (3 tramos)
| Tramo | Rango unidades | Precio c/u | Ahorro vs tramo anterior |
|-------|-----------------|-----------:|--------------------------|
| 1     | 6 – 14          | $1.700     | —                        |
| 2     | 15 – 19         | $1.600     | $100 (↓6%)               |
| 3     | 20+             | $1.500     | $100 (↓6%)               |

Se pueden combinar sabores para acceder a un tramo superior.

### Constantes vigentes (`script.js`)
```js
const MINIMO_PEDIDO = 6;
const UMBRAL_TIER2 = 15;  // desde 15
const UMBRAL_TIER3 = 20;  // desde 20
const PRECIO_TIER1 = 1700; // 6-14
const PRECIO_TIER2 = 1600; // 15-19
const PRECIO_TIER3 = 1500; // 20+
```

La función que determina precio unitario según total:
```js
function getPrecioUnitario(total) {
   if (total >= UMBRAL_TIER3) return PRECIO_TIER3;
   if (total >= UMBRAL_TIER2) return PRECIO_TIER2;
   if (total >= MINIMO_PEDIDO) return PRECIO_TIER1;
   return PRECIO_TIER1; // fallback
}
```

## Estructura de archivos principal
```
index.html      # Marcado principal
styles.css      # Estilos (componentes + utilidades + responsive)
script.js       # Lógica: datos, render dinámico, interacción, mapa
comunas.geojson # Datos de comunas (cobertura)
README.md       # Este documento
```

## Flujo de cotización
1. Usuario ajusta cantidades por sabor (+ / -).
2. Se recalcula total y se determina tramo (se actualiza precio unitario y mensaje upsell).
3. Al cumplir mínimo (6) se habilita botón Solicitar (desktop + barra móvil).
4. Al enviar: se construye `mailto:` con detalle, listo para completar y enviar.

## Cómo cambiar precios / tramos
1. Editar valores de las constantes.
2. Si agregas un nuevo tramo (ej. 30+):
    - Añadir nueva constante (`UMBRAL_TIER4`, `PRECIO_TIER4`).
    - Ajustar `getPrecioUnitario` y el array de `tramos` dentro de `renderPreciosTramos()`.
3. Guardar y refrescar (no hay build step).

## Añadir un nuevo sabor
En `script.js`, dentro de `saboresData`:
```js
{ key: 'nuevo-sabor', nombre: 'Nuevo Sabor', precio: PRECIO_TIER3, ingredientes: ['Ingrediente A','Ingrediente B'] }
```
La tarjeta de pedido se regenera automáticamente (no duplicar HTML). Asegura que `key` sea única y en minúsculas con guiones.

## Cambiar correo de destino
Editar:
```js
const EMAIL_DESTINO = 'tucorreo@ejemplo.com';
```

## Mapa de cobertura
- Usa Leaflet + Turf para unir polígonos en uno simplificado (hull convex/concave fallback).
- Marcadores centrados por comuna.

## Accesibilidad implementada
- `aria-live` para anuncios de total y precios.
- Botones con `aria-label` descriptivo.
- Foco visible en enlaces y botones.
- Scroll suave progresivo (no rompe accesibilidad base si JS falla).

## Social proof / marketing
- Destacado de mejor tramo (color y badge).
- Línea de conversión rápida bajo las tarjetas.
- Ahorro absoluto + porcentual para reforzar escalado.

## Limitaciones actuales
- Sin persistencia (se pierde al recargar).
- No hay validación avanzada de teléfono.
- Dependencia de cliente para email (mailto puede abrir en apps distintas).

## Ideas futuras
- LocalStorage para conservar selección.
- Envío vía API / backend ligero (sin depender de mailto).
- Etiquetas de alérgenos y filtros.
- Modo oscuro opcional.
- Métricas de conversión (evento de clic en “Solicitar”).

## Ejecución local
Abrir directamente `index.html` o, opcional para probar desde un puerto:
```bash
python -m http.server 8080
```

## Notas de refactor (2025)
- Eliminado código duplicado de precios.
- Migración a render dinámico de tarjetas de precios.
- Mejora de mensajes de upsell y social proof.
- Limpieza de clases y estilos obsoletos de la grilla antigua.

---
Si detectas un precio inconsistente entre README y la UI, la fuente de verdad siempre son las constantes en `script.js`.