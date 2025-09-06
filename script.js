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

// Formulario de cotización
document.getElementById('cotizacionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Obtener sabores seleccionados
    const saboresSeleccionados = [];
    document.querySelectorAll('input[name="sabores"]:checked').forEach(checkbox => {
        saboresSeleccionados.push(checkbox.value);
    });
    
    // Validaciones
    if (!validateForm(data, saboresSeleccionados)) {
        return;
    }
    
    // Preparar email
    const emailData = prepareEmailData(data, saboresSeleccionados);
    
    // Enviar email (usando mailto temporal)
    sendEmail(emailData);
    
    // Mostrar mensaje de éxito
    showSuccessMessage();
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

function prepareEmailData(data, sabores) {
    const cantidad = parseInt(data.cantidad);
    const precioUnitario = cantidad >= 15 ? 1500 : 1650;
    const total = cantidad * precioUnitario;
    
    const saboresTexto = sabores.map(sabor => {
        return sabor.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }).join(', ');
    
    const subject = `Cotización Tortas en Vaso - ${data.cantidad} unidades`;
    
    const body = `
Hola Delicias Florencia,

Me gustaría solicitar una cotización para tortas en vaso con los siguientes detalles:

INFORMACIÓN DEL PEDIDO:
• Cantidad: ${data.cantidad} unidades
• Sabores: ${saboresTexto}
• Detalle de sabores: ${data['sabores-detalle'] || 'No especificado'}
• Precio estimado: $${precioUnitario} por unidad (Total aprox: $${total.toLocaleString()})

INFORMACIÓN DE ENTREGA:
• Fecha deseada: ${data.fecha}
• Dirección: ${data.direccion}

INFORMACIÓN DE CONTACTO:
• Teléfono: ${data.telefono}

COMENTARIOS ADICIONALES:
${data.comentarios || 'Ninguno'}

Quedo atenta a su respuesta.

Saludos cordiales.
    `.trim();
    
    return { subject, body };
}

function sendEmail(emailData) {
    const mailtoLink = `mailto:johnrojas297@gmail.com?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.location.href = mailtoLink;
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