// ==========================
// Constantes de configuración mayorista
// ==========================
const MINIMO_PEDIDO = 6; // Pedido mínimo mayorista (6 unidades cualquier formato)
// Tramos de precios mayoristas formato 12oz
const UMBRAL_TIER2 = 15; // desde 15 unidades
const UMBRAL_TIER3 = 20; // desde 20 unidades
const PRECIO_12OZ_TIER1 = 1700; // 6 - 14 unidades
const PRECIO_12OZ_TIER2 = 1600; // 15 - 19 unidades  
const PRECIO_12OZ_TIER3 = 1500; // 20+ unidades

// Tramos de precios mayoristas formato 9oz
const PRECIO_9OZ_TIER1 = 1500; // 6 - 14 unidades
const PRECIO_9OZ_TIER2 = 1400; // 15 - 19 unidades  
const PRECIO_9OZ_TIER3 = 1250; // 20+ unidades
const EMAIL_DESTINO = 'ventas@deliciasflorencia.cl'; // Email comercial
const COMUNAS_PERMITIDAS = Object.freeze(['San Bernardo','La Pintana','El Bosque','La Cisterna', 'Zona de cobertura']);
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
function getPrecioUnitario(total, formato = '12oz') {
    if (formato === '9oz') {
        if (total >= UMBRAL_TIER3) return PRECIO_9OZ_TIER3;
        if (total >= UMBRAL_TIER2) return PRECIO_9OZ_TIER2;
        if (total >= MINIMO_PEDIDO) return PRECIO_9OZ_TIER1;
        return PRECIO_9OZ_TIER1; // fallback
    } else {
        if (total >= UMBRAL_TIER3) return PRECIO_12OZ_TIER3;
        if (total >= UMBRAL_TIER2) return PRECIO_12OZ_TIER2;
        if (total >= MINIMO_PEDIDO) return PRECIO_12OZ_TIER1;
        return PRECIO_12OZ_TIER1; // fallback
    }
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
    // Formato 12oz
    { key: 'pina-crema-12oz', nombre: 'Piña Crema (12oz)', precio: PRECIO_12OZ_TIER3, formato: '12oz', ingredientes: ['Bizcocho Blanco', 'Piña', 'Crema', 'Manjar'], imagen: 'pina-crema.jpg' },
    { key: 'oreo-12oz', nombre: 'Oreo (12oz)', precio: PRECIO_12OZ_TIER3, formato: '12oz', ingredientes: ['Bizcocho Chocolate', 'Crema', 'Galleta Oreo', 'Manjar'], imagen: 'oreo.jpg' },
    { key: 'tres-leches-12oz', nombre: 'Tres Leches (12oz)', precio: PRECIO_12OZ_TIER3, formato: '12oz', ingredientes: ['Bizcocho Blanco', 'Tres tipos de leche', 'Crema Chantilly'], imagen: 'tres-leches.png' },
    { key: 'selva-negra-12oz', nombre: 'Selva Negra (12oz)', precio: PRECIO_12OZ_TIER3, formato: '12oz', ingredientes: ['Bizcocho Chocolate', 'Cerezas', 'Crema Chantilly', 'Virutas de chocolate'], imagen: 'selva-negra.jpg' },
    // Formato 9oz
    { key: 'pina-crema-9oz', nombre: 'Piña Crema (9oz)', precio: PRECIO_9OZ_TIER3, formato: '9oz', ingredientes: ['Bizcocho Blanco', 'Piña', 'Crema', 'Manjar'], imagen: 'pina-crema.jpg' },
    { key: 'oreo-9oz', nombre: 'Oreo (9oz)', precio: PRECIO_9OZ_TIER3, formato: '9oz', ingredientes: ['Bizcocho Chocolate', 'Crema', 'Galleta Oreo', 'Manjar'], imagen: 'oreo.jpg' },
    { key: 'tres-leches-9oz', nombre: 'Tres Leches (9oz)', precio: PRECIO_9OZ_TIER3, formato: '9oz', ingredientes: ['Bizcocho Blanco', 'Tres tipos de leche', 'Crema Chantilly'], imagen: 'tres-leches.png' },
    { key: 'selva-negra-9oz', nombre: 'Selva Negra (9oz)', precio: PRECIO_9OZ_TIER3, formato: '9oz', ingredientes: ['Bizcocho Chocolate', 'Cerezas', 'Crema Chantilly', 'Virutas de chocolate'], imagen: 'selva-negra.jpg' }
]);

const cantidades = Object.fromEntries(saboresData.map(s => [s.key, 0]));

// ==========================
// Render dinámico tarjetas pedido (optimizado)
// ==========================
function renderSaboresPedido() {
    const cont = document.getElementById('sabores-pedido');
    if (!cont) return;
    
    // Obtener sabores únicos (sin duplicar por formato)
    const saboresUnicos = [
        { key: 'pina-crema', nombre: 'Piña Crema', ingredientes: ['Bizcocho Blanco', 'Piña', 'Crema', 'Manjar'], imagen: 'pina-crema.jpg' },
        { key: 'oreo', nombre: 'Oreo', ingredientes: ['Bizcocho Chocolate', 'Crema', 'Galleta Oreo', 'Manjar'], imagen: 'oreo.jpg' },
        { key: 'tres-leches', nombre: 'Tres Leches', ingredientes: ['Bizcocho Blanco', 'Tres tipos de leche', 'Crema Chantilly'], imagen: 'tres-leches.png' },
        { key: 'selva-negra', nombre: 'Selva Negra', ingredientes: ['Bizcocho Chocolate', 'Cerezas', 'Crema Chantilly', 'Virutas de chocolate'], imagen: 'selva-negra.jpg' }
    ];
    
    cont.innerHTML = saboresUnicos.map(s => {
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
            <div class="formatos-controles">
                <div class="formato-control" data-formato="12oz">
                    <div class="formato-header">
                        <span class="formato-label">12oz</span>
                        <span class="formato-precio">$${getPrecioUnitario(MINIMO_PEDIDO, '12oz').toLocaleString('es-CL')}</span>
                    </div>
                    <div class="sabor-cantidad-row">
                        <button type="button" class="menos-btn" data-formato="12oz" aria-label="Restar ${s.nombre} 12oz">-</button>
                        <span class="cantidad" data-formato="12oz" aria-live="off">0</span>
                        <button type="button" class="mas-btn" data-formato="12oz" aria-label="Sumar ${s.nombre} 12oz">+</button>
                    </div>
                </div>
                <div class="formato-control" data-formato="9oz">
                    <div class="formato-header">
                        <span class="formato-label">9oz</span>
                        <span class="formato-precio">$${getPrecioUnitario(MINIMO_PEDIDO, '9oz').toLocaleString('es-CL')}</span>
                    </div>
                    <div class="sabor-cantidad-row">
                        <button type="button" class="menos-btn" data-formato="9oz" aria-label="Restar ${s.nombre} 9oz">-</button>
                        <span class="cantidad" data-formato="9oz" aria-live="off">0</span>
                        <button type="button" class="mas-btn" data-formato="9oz" aria-label="Sumar ${s.nombre} 9oz">+</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ==========================
// Render y estado carrito (optimizado)
// ==========================
function actualizarResumen() {
    const cards = $$('.sabor-card-pedido');
    let totalCantidad = 0;
    let total12oz = 0;
    let total9oz = 0;
    
    cards.forEach(card => {
        const saborKey = card.getAttribute('data-sabor');
        
        // Actualizar controles para cada formato
        ['12oz', '9oz'].forEach(formato => {
            const key = `${saborKey}-${formato}`;
            const cantidadSpan = card.querySelector(`.cantidad[data-formato="${formato}"]`);
            const menosBtn = card.querySelector(`.menos-btn[data-formato="${formato}"]`);
            const val = cantidades[key] || 0;
            
            if (cantidadSpan) cantidadSpan.textContent = val;
            if (menosBtn) menosBtn.disabled = val === 0;
            if (cantidadSpan) {
                cantidadSpan.classList.remove('bump');
                void cantidadSpan.offsetWidth;
                cantidadSpan.classList.add('bump');
            }
            
            totalCantidad += val;
            if (formato === '12oz') {
                total12oz += val;
            } else {
                total9oz += val;
            }
        });
    });

    // Actualizar precios mostrados en tiempo real
    cards.forEach(card => {
        const precio12ozSpan = card.querySelector('.formato-control[data-formato="12oz"] .formato-precio');
        const precio9ozSpan = card.querySelector('.formato-control[data-formato="9oz"] .formato-precio');
        
        if (precio12ozSpan) {
            precio12ozSpan.textContent = `$${getPrecioUnitario(total12oz, '12oz').toLocaleString('es-CL')}`;
        }
        if (precio9ozSpan) {
            precio9ozSpan.textContent = `$${getPrecioUnitario(total9oz, '9oz').toLocaleString('es-CL')}`;
        }
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

    // Calcular totales por formato
    const precio12oz = getPrecioUnitario(total12oz, '12oz');
    const precio9oz = getPrecioUnitario(total9oz, '9oz');
    const total12ozMonto = total12oz * precio12oz;
    const total9ozMonto = total9oz * precio9oz;
    const totalFinal = total12ozMonto + total9ozMonto;

    const resumenPrecioUnitario = $('#resumen-precio-unitario');
    const resumenTotalCantidad = $('#resumen-total-cantidad');
    const resumenTotal = $('#resumen-total');
    const upsellHint = $('#upsell-hint');
    
    // Mostrar información de precios
    if (resumenPrecioUnitario) {
        let textoPrecios = '';
        if (total12oz > 0 && total9oz > 0) {
            textoPrecios = `12oz: $${precio12oz.toLocaleString('es-CL')} | 9oz: $${precio9oz.toLocaleString('es-CL')}`;
        } else if (total12oz > 0) {
            textoPrecios = `$${precio12oz.toLocaleString('es-CL')} (12oz)`;
        } else if (total9oz > 0) {
            textoPrecios = `$${precio9oz.toLocaleString('es-CL')} (9oz)`;
        } else {
            textoPrecios = 'Selecciona productos';
        }
        resumenPrecioUnitario.textContent = textoPrecios;
    }
    
    if (resumenTotalCantidad) resumenTotalCantidad.textContent = totalCantidad;
    if (resumenTotal) resumenTotal.textContent = `$${totalFinal.toLocaleString('es-CL')}`;

    if (upsellHint) {
        let msg = '';
        if (totalCantidad >= MINIMO_PEDIDO && totalCantidad < UMBRAL_TIER2) {
            const faltan = UMBRAL_TIER2 - totalCantidad;
            msg = `Agrega ${faltan} unidad${faltan===1?'':'es'} más y mejora el precio unitario (precio mayorista 2).`;
        } else if (totalCantidad >= UMBRAL_TIER2 && totalCantidad < UMBRAL_TIER3) {
            const faltan = UMBRAL_TIER3 - totalCantidad;
            msg = `Con ${faltan} unidad${faltan===1?'':'es'} más alcanzas el mejor precio mayorista.`;
        } else if (totalCantidad >= UMBRAL_TIER3) {
            msg = `Tienes el mejor precio mayorista.`;
        } else {
            msg = `Mínimo ${MINIMO_PEDIDO} unidades para distribución mayorista.`;
        }
        upsellHint.textContent = msg;
    }

    const btnSolicitar = $('#btn-solicitar-pedido');
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

    announce(`Total ${totalCantidad} unidades. Total ${totalFinal}`);
}

// Delegación de eventos para + / - (optimizada)
function configurarDelegacionCantidad() {
    const contenedor = $('.sabores-cards');
    if (!contenedor) return;
    contenedor.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const card = btn.closest('.sabor-card-pedido');
        if (!card) return;
        const saborKey = card.getAttribute('data-sabor');
        const formato = btn.getAttribute('data-formato');
        if (!saborKey || !formato) return;
        
        const key = `${saborKey}-${formato}`;
        
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
    
    // Calcular totales por formato
    let total12oz = 0;
    let total9oz = 0;
    saboresData.forEach(s => {
        if (cantidades[s.key] > 0) {
            if (s.formato === '12oz') {
                total12oz += cantidades[s.key];
            } else if (s.formato === '9oz') {
                total9oz += cantidades[s.key];
            }
        }
    });
    
    const precio12oz = getPrecioUnitario(total12oz, '12oz');
    const precio9oz = getPrecioUnitario(total9oz, '9oz');
    const total12ozMonto = total12oz * precio12oz;
    const total9ozMonto = total9oz * precio9oz;
    const totalFinal = total12ozMonto + total9ozMonto;
    
    const saboresSeleccionados = saboresData.filter(s => cantidades[s.key] > 0);
    if (!saboresSeleccionados.length) return;
    
    const negocio = $('#campo-nombre')?.value.trim();
    const contacto = $('#campo-contacto')?.value.trim();
    const telefono = $('#campo-telefono')?.value.trim();
    const tipo = $('#campo-tipo')?.value;
    const comuna = $('#campo-comuna')?.value;
    const direccion = $('#campo-direccion')?.value.trim();
    
    if (!negocio || !contacto || !telefono || !tipo || !comuna || !direccion) {
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
    body += `Tipo de negocio: ${tipo}%0D%0A`;
    body += `Comuna: ${comuna}%0D%0A`;
    body += `Dirección: ${direccion}%0D%0A`;
    body += `%0D%0A--- PRODUCTOS DE INTERÉS ---%0D%0A`;
    
    // Agrupar por formato
    const sabores12oz = saboresSeleccionados.filter(s => s.formato === '12oz');
    const sabores9oz = saboresSeleccionados.filter(s => s.formato === '9oz');
    
    if (sabores12oz.length > 0) {
        body += `%0D%0AFormato 12oz:%0D%0A`;
        sabores12oz.forEach(s => {
            body += `- ${s.nombre}: ${cantidades[s.key]} unidad(es)%0D%0A`;
        });
        body += `Subtotal 12oz: ${total12oz} unidades a $${precio12oz.toLocaleString('es-CL')} c/u = $${total12ozMonto.toLocaleString('es-CL')}%0D%0A`;
    }
    
    if (sabores9oz.length > 0) {
        body += `%0D%0AFormato 9oz:%0D%0A`;
        sabores9oz.forEach(s => {
            body += `- ${s.nombre}: ${cantidades[s.key]} unidad(es)%0D%0A`;
        });
        body += `Subtotal 9oz: ${total9oz} unidades a $${precio9oz.toLocaleString('es-CL')} c/u = $${total9ozMonto.toLocaleString('es-CL')}%0D%0A`;
    }
    
    body += `%0D%0ATotal estimado: ${totalCantidad} unidades%0D%0A`;
    body += `Valor referencial total: $${totalFinal.toLocaleString('es-CL')}%0D%0A`;
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
    
    // Tramos para formato 12oz
    const tramos12oz = [
        {
            titulo:'Tramo 1 - Inicial',
            rango:`${MINIMO_PEDIDO} - ${UMBRAL_TIER2 - 1} uds`,
            precio:PRECIO_12OZ_TIER1,
            ahorro:null,
            formato: '12oz'
        },
        {
            titulo:'Tramo 2 - Frecuente', 
            rango:`${UMBRAL_TIER2} - ${UMBRAL_TIER3 - 1} uds`,
            precio:PRECIO_12OZ_TIER2,
            ahorro: PRECIO_12OZ_TIER1 - PRECIO_12OZ_TIER2,
            formato: '12oz'
        },
        {
            titulo:'Tramo 3 - Mayorista',
            rango:`${UMBRAL_TIER3}+ uds`,
            precio:PRECIO_12OZ_TIER3,
            ahorro: PRECIO_12OZ_TIER2 - PRECIO_12OZ_TIER3,
            formato: '12oz'
        }
    ];

    // Tramos para formato 9oz
    const tramos9oz = [
        {
            titulo:'Tramo 1 - Inicial',
            rango:`${MINIMO_PEDIDO} - ${UMBRAL_TIER2 - 1} uds`,
            precio:PRECIO_9OZ_TIER1,
            ahorro:null,
            formato: '9oz'
        },
        {
            titulo:'Tramo 2 - Frecuente', 
            rango:`${UMBRAL_TIER2} - ${UMBRAL_TIER3 - 1} uds`,
            precio:PRECIO_9OZ_TIER2,
            ahorro: PRECIO_9OZ_TIER1 - PRECIO_9OZ_TIER2,
            formato: '9oz'
        },
        {
            titulo:'Tramo 3 - Mayorista',
            rango:`${UMBRAL_TIER3}+ uds`,
            precio:PRECIO_9OZ_TIER3,
            ahorro: PRECIO_9OZ_TIER2 - PRECIO_9OZ_TIER3,
            formato: '9oz'
        }
    ];

    const menorPrecio12oz = Math.min(...tramos12oz.map(t=>t.precio)); // Mejor precio 12oz
    const menorPrecio9oz = Math.min(...tramos9oz.map(t=>t.precio)); // Mejor precio 9oz
    
    function generarTarjetasFormato(tramos, tituloFormato, colorAccent = '') {
        return `
        <div class="formato-section">
            <h3 class="formato-titulo ${colorAccent}">${tituloFormato}</h3>
            <div class="precios-grid-simple">
                ${tramos.map(t => {
                    // Cada formato tiene su propio "mejor precio"
                    const best = (t.formato === '12oz' && t.precio === menorPrecio12oz) || 
                                 (t.formato === '9oz' && t.precio === menorPrecio9oz);
                    return `<article class="precio-tramo-simple ${colorAccent}" data-best="${best}" aria-label="${t.rango} precio $${t.precio.toLocaleString('es-CL')}${best?' mejor precio':''}">
                        ${best ? '<span class="precio-badge-simple">Mejor precio</span>' : ''}
                        <div class="pt-rango-simple">${t.rango}</div>
                        <div class="pt-precio-simple">$${t.precio.toLocaleString('es-CL')}</div>
                    </article>`;
                }).join('')}
            </div>
        </div>`;
    }

    cont.innerHTML = `
        ${generarTarjetasFormato(tramos12oz, 'Formato 12oz', 'formato-12oz')}
        ${generarTarjetasFormato(tramos9oz, 'Formato 9oz', 'formato-9oz')}
    `;

    try { cont.setAttribute('data-status','ready'); } catch {}
    if (!cont.innerHTML.trim()) {
        // Fallback estático (no debería ocurrir)
        cont.innerHTML = '<div style="text-align:center;font-size:.8rem;color:#a33;">No se pudieron cargar los precios. Intenta recargar.</div>';
    }

    cont.addEventListener('click', (e)=>{
        const tarjeta = e.target.closest('.precio-tramo-simple');
        if (!tarjeta) return;
        const destino = document.getElementById('cotizar');
        if (destino) destino.scrollIntoView({behavior:'smooth'});
    });
    const nota = document.getElementById('nota-minimo');
    if (nota) nota.textContent = `Pedido mínimo para distribución: ${MINIMO_PEDIDO} unidades (puedes combinar sabores y formatos).`;
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

// Interacciones para especificaciones de capas
function configurarEspecificaciones() {
    const puntos = document.querySelectorAll('.capa-punto');
    const etiquetas = document.querySelectorAll('.capa-etiqueta');
    const lineas = document.querySelectorAll('.capa-linea');
    
    // Detectar si es un dispositivo táctil
    const esTactil = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Variable para tracking del estado activo
    let capaActiva = null;
    let timerDesactivacion = null;
    
    // Función para activar una capa específica
    function activarCapa(numeroCapa) {
        // Limpiar timer anterior
        if (timerDesactivacion) {
            clearTimeout(timerDesactivacion);
        }
        
        // Remover clases activas de todos los elementos
        puntos.forEach(p => p.classList.remove('active'));
        etiquetas.forEach(e => e.classList.remove('active'));
        lineas.forEach(l => l.classList.remove('active'));
        
        // Activar elementos de la capa seleccionada
        const punto = document.querySelector(`.capa-punto-${numeroCapa}`);
        const etiqueta = document.querySelector(`.capa-etiqueta-${numeroCapa}`);
        const linea = document.querySelector(`.capa-linea-${numeroCapa}`);
        
        if (punto && etiqueta && linea) {
            punto.classList.add('active');
            etiqueta.classList.add('active');
            linea.classList.add('active');
            capaActiva = numeroCapa;
            
            // En móvil, auto-desactivar después de 4 segundos
            if (esTactil) {
                timerDesactivacion = setTimeout(() => {
                    desactivarCapas();
                }, 4000);
            }
        }
    }
    
    // Función para desactivar todas las capas
    function desactivarCapas() {
        if (timerDesactivacion) {
            clearTimeout(timerDesactivacion);
        }
        
        puntos.forEach(p => p.classList.remove('active'));
        etiquetas.forEach(e => e.classList.remove('active'));
        lineas.forEach(l => l.classList.remove('active'));
        capaActiva = null;
    }
    
    // Función para manejar el toggle en móvil
    function toggleCapa(numeroCapa) {
        if (capaActiva === numeroCapa) {
            desactivarCapas();
        } else {
            activarCapa(numeroCapa);
        }
    }
    
    // Event listeners para puntos
    puntos.forEach(punto => {
        const numeroCapa = punto.getAttribute('data-capa');
        
        if (esTactil) {
            // En dispositivos táctiles, usar solo click/touch
            punto.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCapa(numeroCapa);
            });
            
            punto.addEventListener('touchstart', (e) => {
                e.preventDefault();
                toggleCapa(numeroCapa);
            });
        } else {
            // En desktop, usar hover + click
            punto.addEventListener('mouseenter', () => {
                activarCapa(numeroCapa);
            });
            
            punto.addEventListener('click', () => {
                activarCapa(numeroCapa);
                timerDesactivacion = setTimeout(() => {
                    desactivarCapas();
                }, 3000);
            });
        }
    });
    
    // Event listeners para etiquetas
    etiquetas.forEach(etiqueta => {
        const numeroCapa = etiqueta.getAttribute('data-capa');
        
        if (esTactil) {
            // En dispositivos táctiles, usar solo click/touch
            etiqueta.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCapa(numeroCapa);
            });
            
            etiqueta.addEventListener('touchstart', (e) => {
                e.preventDefault();
                toggleCapa(numeroCapa);
            });
        } else {
            // En desktop, usar hover + click
            etiqueta.addEventListener('mouseenter', () => {
                activarCapa(numeroCapa);
            });
            
            etiqueta.addEventListener('click', () => {
                activarCapa(numeroCapa);
                timerDesactivacion = setTimeout(() => {
                    desactivarCapas();
                }, 3000);
            });
        }
    });
    
    // Solo en desktop: desactivar cuando el mouse sale del contenedor
    if (!esTactil) {
        const container = document.querySelector('.formato-visual-container');
        if (container) {
            container.addEventListener('mouseleave', () => {
                if (!timerDesactivacion) { // Solo si no hay timer activo por click
                    desactivarCapas();
                }
            });
        }
    }
    
    // Animación de líneas al cargar la página (más lenta para móvil)
    const delayAnimacion = esTactil ? 2000 : 1500;
    setTimeout(() => {
        lineas.forEach((linea, index) => {
            setTimeout(() => {
                linea.style.transform = 'scaleX(0.3)';
                setTimeout(() => {
                    linea.style.transform = 'scaleX(0)';
                }, 500);
            }, index * (esTactil ? 150 : 100));
        });
    }, delayAnimacion);
    
    // En móvil, mostrar indicador visual de que es interactivo
    if (esTactil) {
        // Agregar clase para estilos específicos de móvil
        document.querySelector('.formato-visual-container')?.classList.add('touch-device');
        
        // Pulso suave en los puntos para indicar que son interactivos
        setTimeout(() => {
            puntos.forEach((punto, index) => {
                setTimeout(() => {
                    punto.style.animation = 'pulse 1s ease-in-out';
                    setTimeout(() => {
                        punto.style.animation = '';
                    }, 1000);
                }, index * 200);
            });
        }, 3000);
    }
}

// Inicializar especificaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    configurarEspecificaciones();
});