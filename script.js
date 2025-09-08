// ==========================
// Constantes de configuración mayorista
// ==========================
const MINIMO_PEDIDO = 24; // Pedido mínimo mayorista (2 docenas)
// Nuevos tramos de precios mayoristas
const UMBRAL_TIER2 = 48; // desde 48 (4 docenas)
const UMBRAL_TIER3 = 72; // desde 72 (6 docenas)
const PRECIO_TIER1 = 1200; // 24 - 47 unidades
const PRECIO_TIER2 = 1100; // 48 - 71 unidades  
const PRECIO_TIER3 = 1000; // 72+ unidades
const EMAIL_DESTINO = 'ventas@deliciasflorencia.cl'; // Email comercial
const COMUNAS_PERMITIDAS = Object.freeze(['San Bernardo','La Pintana','El Bosque','La Cisterna', 'Zona de distribución']);
// Coordenadas aproximadas de comunas (centroides simplificados)
const COMUNAS_COORDS = Object.freeze({
    'San Bernardo': { lat: -33.606246, lng: -70.700462 },
    'La Pintana': { lat: -33.579463, lng: -70.648956 },
    'El Bosque': { lat: -33.559729, lng: -70.672550 },
    'La Cisterna': { lat: -33.528348, lng: -70.668608 }
});

// ==========================
// Utilidades
// ==========================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
function getPrecioUnitario(total) {
    if (total >= UMBRAL_TIER3) return PRECIO_TIER3;
    if (total >= UMBRAL_TIER2) return PRECIO_TIER2;
    if (total >= MINIMO_PEDIDO) return PRECIO_TIER1;
    return PRECIO_TIER1; // fallback (no debería cotizar por debajo del mínimo)
}

// Accesibilidad: actualización discreta de estado
function announce(msg) {
    const live = $('#live-updates');
    if (live) live.textContent = msg;
}

// ==========================
// Datos (restaurado)
// ==========================
const saboresData = Object.freeze([
    { key: 'pina-crema', nombre: 'Piña Crema', precio: PRECIO_TIER3, ingredientes: ['Bizcocho Blanco', 'Piña', 'Crema', 'Manjar'], imagen: 'pina-crema.jpg' },
    { key: 'oreo', nombre: 'Oreo', precio: PRECIO_TIER3, ingredientes: ['Bizcocho Chocolate', 'Crema', 'Galleta Oreo', 'Manjar'], imagen: 'oreo.jpg' },
    { key: 'tres-leches', nombre: 'Tres Leches', precio: PRECIO_TIER3, ingredientes: ['Bizcocho Blanco', 'Tres tipos de leche', 'Crema Chantilly'], imagen: 'tres-leches.png' },
    { key: 'selva-negra', nombre: 'Selva Negra', precio: PRECIO_TIER3, ingredientes: ['Bizcocho Chocolate', 'Cerezas', 'Crema Chantilly', 'Virutas de chocolate'], imagen: 'selva-negra.jpg' }
]);

const cantidades = Object.fromEntries(saboresData.map(s => [s.key, 0]));

// ==========================
// Render dinámico tarjetas pedido (restaurado)
// ==========================
function renderSaboresPedido() {
    const cont = document.getElementById('sabores-pedido');
    if (!cont) return;
    cont.innerHTML = saboresData.map(s => {
        const ingredientes = s.ingredientes.map(i => `<li>${i}</li>`).join('');
        return `
        <div class="sabor-card-pedido" data-sabor="${s.key}">
            <h3>${s.nombre}</h3>
            <div class="sabor-img-ingredientes">
                <div class="sabor-img-container">
                    <img src="${s.imagen}" alt="${s.nombre} - Torta artesanal" class="sabor-img" loading="lazy" decoding="async">
                </div>
                <div class="sabor-ingredientes">
                    <strong>Ingredientes:</strong>
                    <ul>${ingredientes}</ul>
                </div>
            </div>
            <div class="sabor-cantidad-row">
                <button type="button" class="menos-btn" aria-label="Restar ${s.nombre}">-</button>
                <span class="cantidad" aria-live="off">0</span>
                <button type="button" class="mas-btn" aria-label="Sumar ${s.nombre}">+</button>
            </div>
        </div>`;
    }).join('');
}

// ==========================
// Render y estado carrito (restaurado)
// ==========================
function actualizarResumen() {
    const cards = $$('.sabor-card-pedido');
    let totalCantidad = 0;
    cards.forEach(card => {
        const key = card.getAttribute('data-sabor');
        const cantidadSpan = card.querySelector('.cantidad');
        const menosBtn = card.querySelector('.menos-btn');
        const val = cantidades[key] || 0;
        if (cantidadSpan) cantidadSpan.textContent = val;
        if (menosBtn) menosBtn.disabled = val === 0;
        if (cantidadSpan) {
            cantidadSpan.classList.remove('bump');
            void cantidadSpan.offsetWidth;
            cantidadSpan.classList.add('bump');
        }
        totalCantidad += val;
    });

    const resumenLista = $('#resumen-lista');
    if (resumenLista) {
        resumenLista.innerHTML = '';
        saboresData.forEach(s => {
            if (cantidades[s.key] > 0) {
                const li = document.createElement('li');
                li.innerHTML = `<span>${s.nombre}</span><span>x ${cantidades[s.key]}</span>`;
                resumenLista.appendChild(li);
            }
        });
    }

    const precioUnitario = getPrecioUnitario(totalCantidad);
    const totalFinal = totalCantidad * precioUnitario;
    const resumenPrecioUnitario = $('#resumen-precio-unitario');
    const resumenTotalCantidad = $('#resumen-total-cantidad');
    const resumenTotal = $('#resumen-total');
    const upsellHint = $('#upsell-hint');
    if (resumenPrecioUnitario) resumenPrecioUnitario.textContent = `$${precioUnitario.toLocaleString('es-CL')}`;
    if (resumenTotalCantidad) resumenTotalCantidad.textContent = totalCantidad;
    if (resumenTotal) resumenTotal.textContent = `$${totalFinal.toLocaleString('es-CL')}`;

        if (upsellHint) {
        let msg = '';
        if (totalCantidad >= MINIMO_PEDIDO && totalCantidad < UMBRAL_TIER2) {
            const faltan = UMBRAL_TIER2 - totalCantidad;
            msg = `Agrega ${faltan} unidad${faltan===1?'':'es'} más y baja a $${PRECIO_TIER2.toLocaleString('es-CL')} c/u (precio mayorista 2).`;
        } else if (totalCantidad >= UMBRAL_TIER2 && totalCantidad < UMBRAL_TIER3) {
            const faltan = UMBRAL_TIER3 - totalCantidad;
            msg = `Con ${faltan} unidad${faltan===1?'':'es'} más alcanzas $${PRECIO_TIER3.toLocaleString('es-CL')} c/u (mejor precio mayorista).`;
        } else if (totalCantidad >= UMBRAL_TIER3) {
            msg = `Tienes el mejor precio mayorista ($${PRECIO_TIER3.toLocaleString('es-CL')} c/u).`;
        } else {
            msg = `Mínimo ${MINIMO_PEDIDO} unidades para distribución mayorista.`;
        }
        upsellHint.textContent = msg;
    }    const btnSolicitar = $('#btn-solicitar-pedido');
    const mobileBar = $('#mobile-cta-bar');
    const mobileTotal = $('#mobile-bar-total');
    const mobileBtn = $('#btn-solicitar-mobile');
    if (btnSolicitar) {
        const habilitado = totalCantidad >= MINIMO_PEDIDO;
        btnSolicitar.disabled = !habilitado;
        btnSolicitar.setAttribute('aria-disabled', String(!habilitado));
        btnSolicitar.textContent = habilitado ? 'Enviar Solicitud Comercial' : `Mínimo ${MINIMO_PEDIDO} unidades (${totalCantidad}/${MINIMO_PEDIDO})`;
    }
    if (mobileBar && mobileTotal && mobileBtn) {
        mobileTotal.textContent = `${totalCantidad} uds · $${totalFinal.toLocaleString('es-CL')}`;
        const habilitado = totalCantidad >= MINIMO_PEDIDO;
        mobileBtn.disabled = !habilitado;
        mobileBtn.setAttribute('aria-disabled', String(!habilitado));
        mobileBar.classList.toggle('visible', totalCantidad > 0);
        document.body.style.paddingBottom = totalCantidad > 0 ? '70px' : '';
    }

    announce(`Total ${totalCantidad} unidades. Precio unitario ${precioUnitario}. Total ${totalFinal}`);
}

// Delegación de eventos para + / -
function configurarDelegacionCantidad() {
    const contenedor = $('.sabores-cards');
    if (!contenedor) return;
    contenedor.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const card = btn.closest('.sabor-card-pedido');
        if (!card) return;
        const key = card.getAttribute('data-sabor');
        if (!key) return;
        if (btn.classList.contains('mas-btn')) {
            cantidades[key] = (cantidades[key] || 0) + 1;
            actualizarResumen();
        } else if (btn.classList.contains('menos-btn')) {
            if (cantidades[key] > 0) {
                cantidades[key] -= 1;
                actualizarResumen();
            }
        }
    });
}

function dispararSolicitud(e) {
    if (e) e.preventDefault();
    const totalCantidad = Object.values(cantidades).reduce((a, b) => a + b, 0);
    if (totalCantidad < MINIMO_PEDIDO) return;
    const precioUnitario = getPrecioUnitario(totalCantidad);
    const totalFinal = totalCantidad * precioUnitario;
    const saboresSeleccionados = saboresData.filter(s => cantidades[s.key] > 0);
    if (!saboresSeleccionados.length) return;
    
    const negocio = $('#campo-nombre')?.value.trim();
    const contacto = $('#campo-contacto')?.value.trim();
    const telefono = $('#campo-telefono')?.value.trim();
    const email = $('#campo-email')?.value.trim();
    const tipo = $('#campo-tipo')?.value;
    const comuna = $('#campo-comuna')?.value;
    const direccion = $('#campo-direccion')?.value.trim();
    const comentarios = $('#campo-comentarios')?.value.trim();
    
    if (!negocio || !contacto || !telefono || !email || !tipo || !comuna || !direccion) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }
    
    if (!COMUNAS_PERMITIDAS.includes(comuna)) {
        alert('Selecciona una comuna dentro de nuestras rutas de distribución.');
        return;
    }
    
    let body = 'Solicitud de catálogo comercial:%0D%0A%0D%0A';
    body += `Negocio: ${negocio}%0D%0A`;
    body += `Contacto: ${contacto}%0D%0A`;
    body += `Teléfono: ${telefono}%0D%0A`;
    body += `Email: ${email}%0D%0A`;
    body += `Tipo de negocio: ${tipo}%0D%0A`;
    body += `Comuna: ${comuna}%0D%0A`;
    body += `Dirección: ${direccion}%0D%0A`;
    if (comentarios) body += `Volumen estimado: ${comentarios}%0D%0A`;
    body += `%0D%0A--- PRODUCTOS DE INTERÉS ---%0D%0A`;
    saboresSeleccionados.forEach(s => {
        body += `- ${s.nombre}: ${cantidades[s.key]} unidad(es)%0D%0A`;
    });
    body += `%0D%0ATotal estimado: ${totalCantidad} unidades%0D%0A`;
    body += `Precio mayorista: $${precioUnitario.toLocaleString('es-CL')} c/u%0D%0A`;
    body += `Valor referencial: $${totalFinal.toLocaleString('es-CL')}%0D%0A`;
    body += `%0D%0AOrigen: Sitio Web Distribución - Delicias Florencia`;
    
    const subject = `Solicitud comercial ${negocio} - ${tipo} (${totalCantidad} uds)`;
    const mailtoUrl = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailtoUrl;
    mostrarMensajeExito();
}

function configurarBotonSolicitar() {
    const btns = $$('button[data-action="solicitar"]');
    if (!btns.length) return;
    btns.forEach(b => b.addEventListener('click', dispararSolicitud));
}


function mostrarMensajeExito() {
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--secondary-color);color:#fff;padding:1.5rem 2rem;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);z-index:10000;font-weight:600;text-align:center;`;
    mensaje.innerHTML = '<i class="fas fa-check-circle" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>¡Solicitud comercial enviada!<br><small>Abriendo correo…</small>';
    document.body.appendChild(mensaje);
    setTimeout(() => mensaje.remove(), 3000);
}

// Navegación móvil accesible
function configurarNav() {
    const hamburger = $('.hamburger');
    const navMenu = $('.nav-menu');
    if (!hamburger || !navMenu) return;
    hamburger.addEventListener('click', () => {
        const active = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active', active);
        hamburger.setAttribute('aria-expanded', String(active));
    });
    $$('.nav-link').forEach(link => link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }));
}

// Scroll suave (progressive enhancement)
function configurarScrollSuave() {
    $$("a[href^='#']").forEach(a => {
        a.addEventListener('click', ev => {
            const href = a.getAttribute('href');
            if (!href) return;
            const target = document.querySelector(href);
            if (!target) return;
            ev.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Animaciones al hacer scroll
function configurarAnimaciones() {
    const elements = $$('.sabor-card, .info-card, .precio-tramo');
    if (!('IntersectionObserver' in window)) return; // fallback silencioso
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = `${(Math.random() * 0.3).toFixed(2)}s`;
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
}

// Mapa de cobertura (Leaflet + GeoJSON local)
function configurarMapaCobertura() {
    const mapEl = document.getElementById('coverage-map');
    if (!mapEl || typeof L === 'undefined') return;

    mapEl.classList.add('coverage-map-loading');

    const centro = [-33.585, -70.67];
    const map = L.map(mapEl, {
        scrollWheelZoom: false,
        attributionControl: true
    }).setView(centro, 12);

    // Capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    fetch('comunas.geojson')
        .then(r => r.json())
        .then(data => {
            const featuresPermitidas = data.features.filter(f =>
                COMUNAS_PERMITIDAS.includes(f.properties.NOMBRE)
            );

            // 🔸 1) Crear polígono unificado
            let union = null;
            featuresPermitidas.forEach(f => {
                union = union ? turf.union(union, f) : f;
            });

            if (union) {
                L.geoJSON(union, {
                    style: {
                        color: '#ff6600',
                        weight: 2,
                        fillColor: '#ffcc99',
                        fillOpacity: 0.15
                    }
                }).addTo(map);
            }

            // 🔸 2) Dibujar polígonos individuales de cada comuna
            const capaComunas = L.geoJSON(featuresPermitidas, {
                style: (feature) => ({
                    color: '#0077cc',
                    weight: 1.5,
                    fillColor: '#66b3ff',
                    fillOpacity: 0.35
                }),
                onEachFeature: (feature, layer) => {
                    layer.bindTooltip(feature.properties.NOMBRE, {
                        permanent: false,
                        direction: 'center'
                    });
                }
            }).addTo(map);

            // Ajustar mapa al área total
            if (union) {
                map.fitBounds(L.geoJSON(union).getBounds());
            } else {
                map.fitBounds(capaComunas.getBounds());
            }

            // 🔸 3) Marcadores en el centro de cada comuna
            Object.entries(COMUNAS_COORDS).forEach(([nombre, { lat, lng }]) => {
                if (COMUNAS_PERMITIDAS.includes(nombre)) {
                    L.marker([lat, lng], { title: nombre })
                        .addTo(map)
                        .bindTooltip(nombre, { direction: 'top', offset: [0, -6] });
                }
            });
        })
        .finally(() => {
            mapEl.classList.remove('coverage-map-loading');
            const fb = mapEl.querySelector('.coverage-map-fallback');
            if (fb) fb.remove();
        });
}

// Generar tarjetas de tramos de precio
function renderPreciosTramos() {
    const cont = document.getElementById('precios-cards');
    if (!cont) return;
    try { cont.setAttribute('data-status','generating'); } catch {}
    const tramos = [
        {
            titulo:'Tramo 1 - Inicial',
            rango:`${MINIMO_PEDIDO} - ${UMBRAL_TIER2 - 1} uds`,
            precio:PRECIO_TIER1,
            ahorro:null,
            descripcion: '2-4 docenas'
        },
        {
            titulo:'Tramo 2 - Frecuente', 
            rango:`${UMBRAL_TIER2} - ${UMBRAL_TIER3 - 1} uds`,
            precio:PRECIO_TIER2,
            ahorro: PRECIO_TIER1 - PRECIO_TIER2,
            descripcion: '4-6 docenas'
        },
        {
            titulo:'Tramo 3 - Mayorista',
            rango:`${UMBRAL_TIER3}+ uds`,
            precio:PRECIO_TIER3,
            ahorro: PRECIO_TIER2 - PRECIO_TIER3,
            descripcion: '6+ docenas'
        }
    ];
    const menorPrecio = Math.min(...tramos.map(t=>t.precio));
    cont.innerHTML = tramos.map(t => {
        const best = t.precio === menorPrecio;
        let ahorroTxt = '';
        if (t.ahorro) {
            const prevPrecio = t.precio + t.ahorro; // reconstruir precio anterior
            const pct = ((t.ahorro / prevPrecio) * 100).toFixed(0);
            ahorroTxt = `Ahorro $${t.ahorro.toLocaleString('es-CL')} c/u · <strong>↓${pct}%</strong>`;
        }
        return `<article class="precio-tramo" data-best="${best}" aria-label="${t.titulo} ${t.rango} precio $${t.precio.toLocaleString('es-CL')}${best?' mejor precio':''}">
            ${best ? '<span class="precio-tramo-badge">Mejor precio</span>' : ''}
            <h3 class="pt-titulo">${t.titulo}</h3>
            <div class="pt-monto" aria-hidden="true">$${t.precio.toLocaleString('es-CL')}</div>
            <div class="pt-unit">c/u</div>
            <div class="pt-rango">${t.rango}</div>
            <div class="pt-descripcion">${t.descripcion}</div>
            <div class="pt-ahorro">${ahorroTxt}</div>
            <button class="pt-cta" data-ir-cotizar="true" aria-label="Cotizar ${t.titulo}">Ver Catálogo</button>
        </article>`;
    }).join('');
    try { cont.setAttribute('data-status','ready'); } catch {}
    if (!cont.innerHTML.trim()) {
        // Fallback estático (no debería ocurrir)
        cont.innerHTML = '<div style="text-align:center;font-size:.8rem;color:#a33;">No se pudieron cargar los precios. Intenta recargar.</div>';
    }

    cont.addEventListener('click', (e)=>{
        const btn = e.target.closest('button[data-ir-cotizar]');
        if (!btn) return;
        const destino = document.getElementById('cotizar');
        if (destino) destino.scrollIntoView({behavior:'smooth'});
    });
    const nota = document.getElementById('nota-minimo');
    if (nota) nota.textContent = `Pedido mínimo para distribución: ${MINIMO_PEDIDO} unidades. Puedes combinar sabores.`;
}


// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
    configurarNav();
    renderSaboresPedido();
    configurarDelegacionCantidad();
    configurarBotonSolicitar();
    configurarScrollSuave();
    configurarAnimaciones();
    configurarMapaCobertura();
    renderPreciosTramos();
    // Verificación tardía por si otro script limpió el contenido
    setTimeout(() => {
        const cont = document.getElementById('precios-cards');
        if (cont && cont.children.length === 0) {
            console.warn('Reintentando renderPreciosTramos (contenedor vacío tras carga)');
            renderPreciosTramos();
        }
    }, 300);
    actualizarResumen();
});

// (Opcional) Parallax deshabilitado para evitar mareo / rendimiento; si se quiere, habilitar con prefers-reduced-motion check.