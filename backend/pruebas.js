import { Pedido } from "./modulos/dominio/pedido.js";
import { Producto } from "./modulos/dominio/producto.js";
import { Notificacion } from "./modulos/dominio/notificacion.js";
import { ItemPedido } from "./modulos/dominio/itemPedido.js";
import { TipoDeUsuario } from "./modulos/dominio/tipoDeUsuario.js";
import { Moneda } from "./modulos/dominio/moneda.js";
import { EstadoPedido } from "./modulos/dominio/estadoPedido.js";
import { FactoryNotificacion } from "./modulos/dominio/factoryNotification.js";
import { crearUsuario } from "./modulos/dominio/usuario.js";

const vendedor = crearUsuario('vendedor-001', 'Juan Perez', 'juanperez@gmail.com', '1112345678', TipoDeUsuario.VENDDOR, new Date("2025-08-22"));
if(vendedor === null){
    console.log("Error al crear el usuario vendedor. Verifique los datos ingresados.");
}

// --- Test 1: Método `estaDisponible()` ---
console.log('--- Corriendo pruebas para `estaDisponible()` ---');
const productoA = new Producto('prod-001', vendedor, 'Zapatillas Deportivas', 'Zapatillas ideales para correr', [], 120, Moneda.DOLAR_USA, 10, [], true);

// Prueba de stock suficiente
if (productoA.estaDisponible(5) === true) {
    console.log('Test 1.1 Pasó: Para un stock de 10, pedir 5 unidades debería está disponible.');
} else {
    console.error('Test 1.1 Falló: Para un stock de 10, pedir 5 unidades debería estar disponible, pero no lo está.');
}

// Prueba de stock justo
if (productoA.estaDisponible(10) === true) {
    console.log('Test 1.2 Pasó: Para un stock de 10, pedir 10 unidades debería está disponible.');
} else {
    console.error('Test 1.2 Falló: Para un stock de 10, pedir 10 unidades debería estar disponible, pero no lo está.');
}

// Prueba de stock insuficiente
if (productoA.estaDisponible(15) === false) {
    console.log('Test 1.3 Pasó: Para un stock de 10, pedir 15 unidades no está disponible.');
} else {
    console.error('Test 1.3 Falló: Para un stock de 10, pedir 15 unidades no debería estar disponible, pero lo está.');
}

console.log('Pruebas para `estaDisponible()` finalizadas.');
console.log('');

// --- Test 2: Método `reducirStock()` ---
console.log('--- Corriendo pruebas para `reducirStock()` ---');
const producto2 = new Producto('prod-002', vendedor, 'Remera Algodón', 'Remera 100% algodón', [], 25, Moneda.PESO_ARG, 20, [], true);

// Reducción de stock válida
producto2.reducirStock(5);
if (producto2.stock === 15) {
    console.log('Test 2.1 Pasó: Para un stock inicial de 20, reducir 5 unidades resulta en 15.');
} else {
    console.error(`Test 2.1 Falló: Para un stock inicial de 20, reducir 5 unidades debería dar 15, pero dio ${producto2.stock}.`);
}

// Reducción de stock al límite
producto2.reducirStock(15);
if (producto2.stock === 0) {
    console.log('Test 2.2 Pasó: Para un stock actual de 15, reducir 15 unidades resulta en 0.');
} else {
    console.error(`Test 2.2 Falló: Para un stock actual de 15, reducir 15 unidades debería dar 0, pero dio ${producto2.stock}.`);
}

// Intento de reducir stock más allá de lo disponible
try {
    producto2.reducirStock(1);
    console.error(`Test 2.3 Falló: El stock no debería ser menor que 0, pero dio ${producto2.stock}.`);
} catch (error) {
    console.log(`Test 2.3 Pasó: No se permitio que el stock sea negativo, se lanzo un error: `, error.getMensaje());
}

console.log('Pruebas para `reducirStock()` finalizadas.');
console.log('');

// --- Test 3: Método `aumentarStock()` ---
console.log('--- Corriendo pruebas para `aumentarStock()` ---');
const producto3 = new Producto('prod-003', vendedor, 'Pantalón Jeans', 'Pantalón de jean clásico', [], 50, Moneda.DOLAR_USA, 5, [], true);

// Aumento de stock válido
producto3.aumentarStock(10);
if (producto3.stock === 15) {
    console.log('Test 3.1 Pasó: Para un stock inicial de 5, aumentar 10 unidades resulta en 15.');
} else {
    console.error(`Test 3.1 Falló: Para un stock inicial de 5, aumentar 10 unidades debería dar 15, pero dio ${producto3.stock}.`);
}

// Aumento de stock de 0 unidades
producto3.aumentarStock(0);
if (producto3.stock === 15) {
    console.log('Test 3.2 Pasó: El stock se mantuvo en 15 después de aumentar 0 unidades.');
} else {
    console.error(`Test 3.2 Falló: El stock debería haberse mantenido en 15, pero dio ${producto3.stock}.`);
}

console.log('Pruebas para `aumentarStock()` finalizadas.');
console.log('');

// --- Test 4: Método `calcularTotal()` ---
console.log('--- Corriendo pruebas para `calcularTotal()` ---');
const prodA = new Producto(3, "vendA", "A", "descA", ["catA"], 100, Moneda.PESO_ARG, 5, [], null);
const prodB = new Producto(4, "vendB", "B", "descB", ["catB"], 50, Moneda.PESO_ARG, 10, [], null);

const itemA = new ItemPedido(prodA, 2, prodA.precio); // 2 x 100 = 200
const itemB = new ItemPedido(prodB, 3, prodB.precio); // 3 x 50 = 150

const comprador = crearUsuario(1, "Paula", "paula@email.com", "12345678", TipoDeUsuario.COMPRADOR, new Date());

const pedidoTest = new Pedido(2, comprador, [itemA, itemB], 0, Moneda.PESO_ARG, null, EstadoPedido.PENDIENTE, new Date(), []);
pedidoTest.calcularTotal();

if (pedidoTest.total === 350) {
    console.log('Test 4.1 Pasó: El cálculo del total es correcto (200 + 150 = 350).');
} else {
    console.error(`Test 4.1 Falló: El total debería ser 350, pero dio ${pedidoTest.total}.`);
}

console.log('Pruebas para `calcularTotal()` finalizadas.');
console.log('');

// --- Test 5: Método `validarStock()` ---

console.log('--- Corriendo pruebas para `validarStock()` ---');

try {
    pedidoTest.validarStock();
    console.log("Test 5.1 Pasó: El stock es suficiente para el pedido.");
} catch (error) {
    console.log('Test 5.2 Falló: El stock debería ser suficiente, pero se lanzó un error:', error.getMensaje());
}
console.log('Pruebas para `aumentarStock()` finalizadas.');
console.log('');

// --- Test 6: Método `actualizarEstado()` ---

console.log('--- Corriendo pruebas para `actualizarEstado()` ---');

// Verifica que el estado se haya actualizado correctamente

pedidoTest.actualizarEstado(EstadoPedido.CONFIRMADO, "Sistema", "Pago recibido");

if (pedidoTest.estado === EstadoPedido.CONFIRMADO) {
    console.log('Test 6.1 Pasó: El estado del pedido se actualizó correctamente a CONFIRMADO.');
} else {
    console.error(`Test 6.1 Falló: El estado del pedido debería ser CONFIRMADO, pero es ${pedidoTest.estado}.`);
}

// Verifica que se haya agregado un nuevo elemento al historial de estados
if (
    pedidoTest.historialEstados.length > 0 &&
    pedidoTest.historialEstados[pedidoTest.historialEstados.length - 1].estado === EstadoPedido.CONFIRMADO &&
    pedidoTest.historialEstados[pedidoTest.historialEstados.length - 1].motivo === "Pago recibido"
) {
    console.log('Test 6.2 Pasó: El historial de estados se actualizó correctamente con el nuevo estado y motivo.');
} else {
    console.error('Test 6.2 Falló: El historial de estados no se actualizó correctamente.');
}

console.log('Pruebas para `validarStock()` finalizadas.');
console.log('');

// --- Test 7: Clase `FactoryNotificacion` y `Notificacion` ---
console.log('--- Corriendo pruebas para `FactoryNotificacion` y `Notificacion` ---');

// Creación de notificación según el estado del pedido ---
const factory = new FactoryNotificacion();

// Caso de estado 'CONFIRMADO'
const mensajeConfirmado = factory.crearSegunEstadoPedido(EstadoPedido.CONFIRMADO);
if (mensajeConfirmado === "NOTIFICACION_NUEVO_PEDIDO") {
    console.log('Test 7.1 Pasó: La notificación de nuevo pedido es correcta para el estado CONFIRMADO.');
} else {
    console.error(`Test 7.1 Falló: Se esperaba 'NOTIFICACION_NUEVO_PEDIDO', pero se obtuvo '${mensajeConfirmado}'.`);
}

// Caso de estado 'ENVIADO'
const mensajeEnviado = factory.crearSegunEstadoPedido(EstadoPedido.ENVIADO);
if (mensajeEnviado === "NOTIFICACION_PEDIDO_ENVIADO") {
    console.log('Test 7.2 Pasó: La notificación de pedido enviado es correcta para el estado ENVIADO.');
} else {
    console.error(`Test 7.2 Falló: Se esperaba 'NOTIFICACION_PEDIDO_ENVIADO', pero se obtuvo '${mensajeEnviado}'.`);
}

// Caso de estado 'CANCELADO'
const mensajeCancelado = factory.crearSegunEstadoPedido(EstadoPedido.CANCELADO);
if (mensajeCancelado === "NOTIFICACION_PEDIDO_CANCELADO") {
    console.log('Test 7.3 Pasó: La notificación de pedido cancelado es correcta para el estado CANCELADO.');
} else {
    console.error(`Test 7.3 Falló: Se esperaba 'NOTIFICACION_PEDIDO_CANCELADO', pero se obtuvo '${mensajeCancelado}'.`);
}

// --- Test 8: Método `marcarComoLeida()` ---
console.log('');
console.log('--- Corriendo pruebas para `marcarComoLeida()` ---');
const notificacion = new Notificacion(1, comprador, 'Tu pedido ha sido enviado', new Date(), false, null);

notificacion.marcarComoLeida();

// Verificamos que la propiedad `leida` cambió a `true`
if (notificacion.leida === true) {
    console.log('Test 8.1 Pasó: La propiedad `leida` se actualizó a `true`.');
} else {
    console.error('Test 8.1 Falló: La propiedad `leida` debería ser `true`, pero es `false`.');
}

// Verificamos que la propiedad `fechaLeida` fue establecida
if (notificacion.fechaLeida !== null && notificacion.fechaLeida instanceof Date) {
    console.log('Test 8.2 Pasó: La propiedad `fechaLeida` se estableció correctamente.');
} else {
    console.error('Test 8.2 Falló: La `fechaLeida` no se estableció como un objeto Date.');
}

console.log('Pruebas para `Notificacion` y `FactoryNotificacion` finalizadas.');