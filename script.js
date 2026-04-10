// Simulación de datos (En producción vendrían de Google Sheets vía Fetch)
let productos = [
    { id: 101, nombre: "Malanga", precio: 80, stock: 50, color: "bg-orange-100" },
    { id: 102, nombre: "Boniato", precio: 45, stock: 120, color: "bg-purple-100" },
    { id: 103, nombre: "Plátano", precio: 15, stock: 200, color: "bg-yellow-100" },
    { id: 104, nombre: "Tomate", precio: 120, stock: 5, color: "bg-red-100" }
];

let carrito = [];

// 1. DIBUJAR PRODUCTOS (Enseñanza: Manipulación del DOM)
function render() {
    const contenedor = document.getElementById('grid-productos');
    contenedor.innerHTML = productos.map(p => `
        <button onclick="agregar(${p.id})" 
                class="${p.color} border-2 border-white rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[120px] active:border-green-500">
            <span class="text-lg font-black text-gray-800">${p.nombre}</span>
            <span class="text-green-700 font-bold">$${p.precio}/lb</span>
            <span class="text-xs mt-2 ${p.stock <= 10 ? 'text-red-600 font-bold' : 'text-gray-500'}">
                Stock: ${p.stock}
            </span>
        </button>
    `).join('');
}

// 2. AGREGAR AL CARRITO (Enseñanza: Lógica de negocio y validación)
function agregar(id) {
    const prod = productos.find(p => p.id === id);
    
    if (prod.stock > 0) {
        carrito.push(prod);
        prod.stock--; // Resta visual inmediata (UX)
        actualizarUI();
    } else {
        alert("¡No queda más " + prod.nombre + "!");
    }
}

// 3. ACTUALIZAR UI (Enseñanza: Reactividad manual)
function actualizarUI() {
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    document.getElementById('total-venta').innerText = total.toFixed(2);
    document.getElementById('cuenta-items').innerText = carrito.length;
    render(); // Refrescamos el grid para mostrar el stock actualizado
}

// 4. PROCESAR VENTA (Enseñanza: Comunicación con el Servidor/Sheets)
async function procesarVenta() {
    if (carrito.length === 0) return;

    const btn = event.target;
    btn.innerText = "Sincronizando...";
    btn.disabled = true;

    // Estructura de datos para Google Apps Script
    const venta = {
        operacion: "REGISTRAR_VENTA",
        vendedor: "Puesto_01",
        items: carrito.map(i => ({ id: i.id, producto: i.nombre, cantidad: 1, precio_venta: i.price }))
    };

    try {
        // En un escenario real: fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify(venta) })
        console.log("Enviando a Google Sheets...", venta);
        
        // Simulamos éxito
        alert("Venta registrada con éxito");
        carrito = [];
        actualizarUI();
    } catch (e) {
        // Enseñanza: Manejo de errores offline
        localStorage.setItem('venta_offline_' + Date.now(), JSON.stringify(venta));
        alert("Sin conexión. Venta guardada localmente.");
    } finally {
        btn.innerText = "A COBRAR";
        btn.disabled = false;
    }
}

render();
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker listo para el mercado', reg))
            .catch(err => console.error('Error al registrar SW', err));
    });
/**
 * FUNCIÓN PARA VACIAR EL CARRITO
 * Concepto: Reversión de estado y actualización de UI
 */
function cancelarVenta() {
    // 1. Antes de vaciar, devolvemos las cantidades al stock visual
    carrito.forEach(item => {
        // Buscamos el producto original en nuestra lista 'productos'
        const prodOriginal = productos.find(p => p.id === item.id);
        if (prodOriginal) {
            prodOriginal.stock++; // Devolvemos la libra al estante
        }
    });

    // 2. Vaciamos el array del carrito
    carrito = [];

    // 3. Refrescamos la pantalla para que el vendedor vea el stock recuperado
    actualizarUI();
    
    console.log("Venta cancelada. El inventario visual se ha restaurado.");
}
function cancelarVenta() {
    // Recarga la página actual saltándose el caché si es necesario
    window.location.reload(); 
}
}

