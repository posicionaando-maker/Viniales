/**
 * LÓGICA DE ADMINISTRACIÓN
 * Enseñanza: Sincronización bidireccional y alertas de stock
 */

let inventario = [];

// 1. Cargar datos (Enseñanza: Fetch y Promesas)
async function inicializar() {
    // Aquí conectarías con tu Google Sheets
    // const res = await fetch(URL_CSV_GOOGLE);
    // inventario = csvToJSON(await res.text());
    
    inventario = [
        { id: 101, nombre: "Malanga", stock: 12, precio: 80 },
        { id: 102, nombre: "Boniato", stock: 5, precio: 45 },
        { id: 103, nombre: "Tomate", stock: 0, precio: 120 }
    ];
    
    actualizarInterfaz();
}

// 2. Lógica de UI para el Administrador
function actualizarInterfaz() {
    const cuerpo = document.getElementById('tabla-cuerpo');
    const select = document.getElementById('input-prod');
    let criticos = 0;
    let stockTotal = 0;

    cuerpo.innerHTML = "";
    select.innerHTML = "<option value=''>Seleccionar Vianda...</option>";

    inventario.forEach(p => {
        // Conteo para KPIs
        if (p.stock <= 5) criticos++;
        stockTotal += p.stock;

        // Inyectar en Select
        select.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;

        // Inyectar en Tabla
        const estado = p.stock === 0 ? '🔴 AGOTADO' : (p.stock <= 5 ? '🟡 BAJO' : '🟢 OK');
        cuerpo.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition">
                <td class="p-4 font-semibold text-slate-700">${p.nombre}</td>
                <td class="p-4">${p.stock} lb</td>
                <td class="p-4">$${p.precio}</td>
                <td class="p-4 text-sm font-bold">${estado}</td>
            </tr>
        `;
    });

    document.getElementById('kpi-criticos').innerText = criticos;
    document.getElementById('kpi-stock').innerText = stockTotal + " lb";
}

// 3. Registrar Entrada (Enseñanza: Escritura en la base de datos)
async function guardarEntrada() {
    const id = document.getElementById('input-prod').value;
    const cant = document.getElementById('input-cant').value;
    
    if(!id || !cant) return alert("Completa los datos");

    const data = {
        operacion: "ENTRADA_STOCK",
        id_producto: id,
        cantidad: cant
    };

    console.log("Enviando entrada a Google Sheets...", data);
    
    // Simulación de éxito:
    const prod = inventario.find(p => p.id == id);
    prod.stock += parseFloat(cant);
    
    alert(`Entrada registrada: +${cant}lb de ${prod.nombre}`);
    actualizarInterfaz();
}

inicializar();
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker listo para el mercado', reg))
            .catch(err => console.error('Error al registrar SW', err));
    });
}
