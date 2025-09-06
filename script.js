// ==========================
// Constantes de configuración
// ==========================
const MINIMO_PEDIDO = 6;
const UMBRAL_MAYORISTA = 15;
const PRECIO_NORMAL = 1650;
const PRECIO_MAYORISTA = 1500;
const EMAIL_DESTINO = 'deliciasflorencia@email.com'; // TODO: parametrizar

// ==========================
// Utilidades
// ==========================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const getPrecioUnitario = total => total >= UMBRAL_MAYORISTA ? PRECIO_MAYORISTA : PRECIO_NORMAL;

// Accesibilidad: actualización discreta de estado
function announce(msg) {
    const live = $('#live-updates');
    if (live) {
        live.textContent = msg;
    }
}

// ==========================
// Datos (centralizado)
// ==========================
const saboresData = Object.freeze([
    { key: 'pina-crema', nombre: 'Piña Crema', precio: PRECIO_MAYORISTA, ingredientes: ['Bizcocho Blanco', 'Piña', 'Crema', 'Manjar'] },
    { key: 'oreo', nombre: 'Oreo', precio: PRECIO_MAYORISTA, ingredientes: ['Bizcocho Chocolate', 'Crema', 'Galleta Oreo', 'Manjar'] },
    { key: 'tres-leches', nombre: 'Tres Leches', precio: PRECIO_MAYORISTA, ingredientes: ['Bizcocho Blanco', 'Tres tipos de leche', 'Crema Chantilly'] },
    { key: 'selva-negra', nombre: 'Selva Negra', precio: PRECIO_MAYORISTA, ingredientes: ['Bizcocho Chocolate', 'Cerezas', 'Crema Chantilly', 'Virutas de chocolate'] }
]);

const cantidades = Object.fromEntries(saboresData.map(s => [s.key, 0]));

// ==========================
// Render dinámico tarjetas pedido
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
                <div class="sabor-img-placeholder" aria-hidden="true"></div>
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
// Render y estado carrito
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
        // Animación bump
        if (cantidadSpan) {
            cantidadSpan.classList.remove('bump');
            void cantidadSpan.offsetWidth; // reflow para reiniciar animación
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

    // Totales
    const precioUnitario = getPrecioUnitario(totalCantidad);
    const totalFinal = totalCantidad * precioUnitario;
    const resumenPrecioUnitario = $('#resumen-precio-unitario');
    const resumenTotalCantidad = $('#resumen-total-cantidad');
    const resumenTotal = $('#resumen-total');
    if (resumenPrecioUnitario) resumenPrecioUnitario.textContent = `$${precioUnitario.toLocaleString('es-CL')}`;
    if (resumenTotalCantidad) resumenTotalCantidad.textContent = totalCantidad;
    if (resumenTotal) resumenTotal.textContent = `$${totalFinal.toLocaleString('es-CL')}`;

    // Botón
    const btnSolicitar = $('#btn-solicitar-pedido');
    if (btnSolicitar) {
        const habilitado = totalCantidad >= MINIMO_PEDIDO;
        btnSolicitar.disabled = !habilitado;
        btnSolicitar.setAttribute('aria-disabled', String(!habilitado));
        btnSolicitar.textContent = habilitado ? 'Solicitar pedido' : `Mínimo ${MINIMO_PEDIDO} unidades (${totalCantidad}/${MINIMO_PEDIDO})`;
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

function configurarBotonSolicitar() {
    const btn = $('#btn-solicitar-pedido');
    if (!btn) return;
    btn.addEventListener('click', e => {
        e.preventDefault();
        const totalCantidad = Object.values(cantidades).reduce((a, b) => a + b, 0);
        if (totalCantidad < MINIMO_PEDIDO) return; // botón ya deshabilita
        const precioUnitario = getPrecioUnitario(totalCantidad);
        const totalFinal = totalCantidad * precioUnitario;
        const saboresSeleccionados = saboresData.filter(s => cantidades[s.key] > 0);
        if (!saboresSeleccionados.length) return;
        let body = 'Pedido de cotización:%0D%0A%0D%0A';
        saboresSeleccionados.forEach(s => {
            body += `- ${s.nombre}: ${cantidades[s.key]} unidad(es)%0D%0A`;
        });
        body += `%0D%0ATotal unidades: ${totalCantidad}%0D%0A`;
        body += `Precio unitario: $${precioUnitario.toLocaleString('es-CL')}%0D%0A`;
        body += `Total: $${totalFinal.toLocaleString('es-CL')}%0D%0A`;
        body += `%0D%0AOrigen: Sitio Web Delicias Florencia`;
        const subject = `Cotización web (${totalCantidad} uds)`;
        const mailtoUrl = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.location.href = mailtoUrl;
        mostrarMensajeExito();
    });
}

function mostrarMensajeExito() {
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--secondary-color);color:#fff;padding:1.5rem 2rem;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);z-index:10000;font-weight:600;text-align:center;`;
    mensaje.innerHTML = '<i class="fas fa-check-circle" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>¡Solicitud preparada!<br><small>Abriendo correo…</small>';
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
    const elements = $$('.sabor-card, .precio-card, .info-card');
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

// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
    configurarNav();
    renderSaboresPedido();
    configurarDelegacionCantidad();
    configurarBotonSolicitar();
    configurarScrollSuave();
    configurarAnimaciones();
    actualizarResumen();
});

// (Opcional) Parallax deshabilitado para evitar mareo / rendimiento; si se quiere, habilitar con prefers-reduced-motion check.