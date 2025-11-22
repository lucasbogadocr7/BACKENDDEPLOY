import { Producto } from '../../modulos/dominio/producto.js';
import { Pedido } from '../../modulos/dominio/pedido.js';
import { crearUsuario } from '../../modulos/dominio/usuario.js';
import { TipoDeUsuario } from '../../modulos/dominio/tipoDeUsuario.js';
import { Moneda } from '../../modulos/dominio/moneda.js';
import { ItemPedido } from '../../modulos/dominio/itemPedido.js';
import { EstadoPedido } from '../../modulos/dominio/estadoPedido.js';
import { ErrorDeStock } from '../../errores/errorDeStock.js';
import { CambioEstadoPedido } from '../../modulos/dominio/cambioEstadoPedido.js';


describe('Pedido', () => {
    let prodA, prodB, itemA, itemB, comprador, pedidoTest;

    beforeEach(() => {
        prodA = new Producto("vendA", "A", "descA", ["catA"], 100, Moneda.PESO_ARG, 5, [], null, 10);
        prodB = new Producto("vendB", "B", "descB", ["catB"], 50, Moneda.PESO_ARG, 10, [], null, 11);

        itemA = new ItemPedido(prodA, 2, prodA.precio); // 2 x 100 = 200
        itemB = new ItemPedido(prodB, 3, prodB.precio); // 3 x 50 = 150

        comprador = crearUsuario(1, "Paula", "paula@email.com", "12345678", TipoDeUsuario.COMPRADOR, new Date());
        pedidoTest = new Pedido(comprador, [itemA, itemB], 0, Moneda.PESO_ARG, null, EstadoPedido.PENDIENTE, new Date(), []);
    });

    describe('`calcularTotal()`', () => {
        test('debe calcular el total del pedido correctamente', () => {
            pedidoTest.calcularTotal();
            expect(pedidoTest.total).toBe(350);
        });
    });

    describe('`validarStock()`', () => {
        test('no debe lanzar un error si el stock es suficiente', () => {
            expect(() => pedidoTest.validarStock()).not.toThrow();
        });

        test('debe lanzar un error si el stock no es suficiente', () => {
            prodB.reducirStock(9);
            expect(() => pedidoTest.validarStock()).toThrow(ErrorDeStock);
        });
    });

    describe('`actualizarEstado()`', () => {
        test('debe actualizar el estado del pedido correctamente', () => {
            pedidoTest.actualizarEstado(EstadoPedido.CONFIRMADO, 'vendedor', 'Pago recibido');
            expect(pedidoTest.estado).toBe(EstadoPedido.CONFIRMADO);
        });

        test('debe agregar un nuevo elemento al historial de estados', () => {
            const initialLength = pedidoTest.historialEstados.length;
            pedidoTest.actualizarEstado(EstadoPedido.CONFIRMADO, 'vendedor', 'Pago recibido');
            
            // Verifica que la longitud del historial aumentó en 1
            expect(pedidoTest.historialEstados.length).toBe(initialLength + 1);
            
            // Verifica que el último elemento del historial sea el esperado
            const ultimoEstado = pedidoTest.historialEstados[pedidoTest.historialEstados.length - 1];
            expect(ultimoEstado.estado).toBe(EstadoPedido.CONFIRMADO);
            expect(ultimoEstado.motivo).toBe('Pago recibido');
        });
    });
});