// Navegación móvil
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Fecha mínima (4 días desde hoy)
const fechaInput = document.getElementById('fecha');
const today = new Date();
const minDate = new Date(today);
minDate.setDate(today.getDate() + 4);

// Formatear fecha para input
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

fechaInput.min = formatDate(minDate);

// Scroll suave para navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


// Carrito de sabores para cotización
const carritoSabores = [];
const saborSelect = document.getElementById('sabor-select');
const saborCantidad = document.getElementById('sabor-cantidad');
const agregarSaborBtn = document.getElementById('agregar-sabor');
const carritoLista = document.getElementById('carrito-sabores-lista');
const saboresCarritoInput = document.getElementById('sabores-carrito');

function renderCarritoSabores() {
    carritoLista.innerHTML = '';
    carritoSabores.forEach((item, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${item.saborNombre}</strong> - ${item.cantidad} unidad(es)</span> <button type="button" class="eliminar-sabor" data-idx="${idx}">Eliminar</button>`;
        carritoLista.appendChild(li);
    });
    saboresCarritoInput.value = JSON.stringify(carritoSabores);
}

agregarSaborBtn.addEventListener('click', () => {
    const sabor = saborSelect.value;
    const cantidad = parseInt(saborCantidad.value);
    if (!sabor || cantidad < 1) return;
    const saborNombre = saborSelect.options[saborSelect.selectedIndex].text;
    // Si ya existe, suma cantidad
    const existente = carritoSabores.find(item => item.sabor === sabor);
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carritoSabores.push({ sabor, saborNombre, cantidad });
    }
    renderCarritoSabores();
});

carritoLista.addEventListener('click', (e) => {
    if (e.target.classList.contains('eliminar-sabor')) {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        carritoSabores.splice(idx, 1);
        renderCarritoSabores();
    }
});

// Formulario de cotización
document.getElementById('cotizacionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    let total = 0;
    try {
        const sabores = JSON.parse(data['sabores-carrito'] || '[]');
        total = sabores.reduce((acc, s) => acc + parseInt(s.cantidad), 0);
        if (total < 6) {
            alert('La cantidad mínima es 6 unidades en total.');
            return;
        }
        if (sabores.length === 0) {
            alert('Agrega al menos un sabor.');
            return;
        }
        // Preparar mailto con los datos del carrito
        const mailto = buildMailtoPedido(data, sabores);
        window.location.href = mailto;
        showSuccessMessage();
    } catch (err) {
        alert('Error en la selección de sabores.');
    }
});

function validateForm(data, sabores) {
    // Validar cantidad mínima
    if (parseInt(data.cantidad) < 6) {
        alert('La cantidad mínima es 6 unidades');
        return false;
    }
    
    // Validar que se haya seleccionado al menos un sabor
    if (sabores.length === 0) {
        alert('Debes seleccionar al menos un sabor');
        return false;
    }
    
    // Validar fecha
    const selectedDate = new Date(data.fecha);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 4);
    
    if (selectedDate < minDate) {
        alert('La fecha debe ser con mínimo 4 días de anticipación');
        return false;
    }
    
    return true;
}


function buildMailtoPedido(data, sabores) {
    const destinatario = 'deliciasflorencia@email.com'; // Cambia por el correo real del negocio
    let subject = `Nueva cotización de ${data.telefono || 'cliente web'}`;
    let body = `¡Nuevo pedido de cotización!%0D%0A%0D%0A`;
    body += `Nombre: ${data.nombre || ''}%0D%0A`;
    body += `Teléfono: ${data.telefono || ''}%0D%0A`;
    body += `Fecha deseada: ${data.fecha || ''}%0D%0A`;
    body += `Dirección: ${data.direccion || ''}%0D%0A`;
    body += `Comentarios: ${data.comentarios || ''}%0D%0A%0D%0A`;
    body += `Sabores y cantidades:%0D%0A`;
    sabores.forEach(s => {
        body += `- ${s.saborNombre}: ${s.cantidad} unidad(es)%0D%0A`;
    });
    body += `%0D%0A¡Revisar y contactar al cliente!`;
    return `mailto:${destinatario}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

function showSuccessMessage() {
    // Crear mensaje de éxito
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ¡Cotización enviada! Te contactaremos pronto.
    `;
    
    // Agregar después del formulario
    const form = document.getElementById('cotizacionForm');
    form.parentNode.insertBefore(successDiv, form.nextSibling);
    
    // Limpiar formulario
    form.reset();
    
    // Remover mensaje después de 5 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Calcular precio en tiempo real
document.getElementById('cantidad').addEventListener('input', function() {
    const cantidad = parseInt(this.value) || 0;
    updatePriceDisplay(cantidad);
});

function updatePriceDisplay(cantidad) {
    // Encontrar elementos donde mostrar el precio
    const priceElements = document.querySelectorAll('.precio-calculado');
    
    if (cantidad >= 6) {
        const precioUnitario = cantidad >= 15 ? 1500 : 1650;
        const total = cantidad * precioUnitario;
        
        priceElements.forEach(el => {
            el.textContent = `${cantidad} unidades × $${precioUnitario} = $${total.toLocaleString()}`;
        });
    } else {
        priceElements.forEach(el => {
            el.textContent = '';
        });
    }
}

// Agregar elemento para mostrar precio calculado
document.addEventListener('DOMContentLoaded', function() {
    const cantidadInput = document.getElementById('cantidad');
    const priceDisplay = document.createElement('div');
    priceDisplay.className = 'precio-calculado';
    priceDisplay.style.cssText = `
        margin-top: 0.5rem;
        padding: 0.8rem;
        background: var(--accent-color);
        border-radius: 8px;
        font-weight: 600;
        color: var(--primary-color);
        text-align: center;
    `;
    
    cantidadInput.parentNode.appendChild(priceDisplay);
});

// Animaciones al hacer scroll
const observeElements = () => {
    const elements = document.querySelectorAll('.sabor-card, .precio-card, .info-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = `${Math.random() * 0.3}s`;
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(el => observer.observe(el));
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', observeElements);

// Efecto parallax suave para el hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});